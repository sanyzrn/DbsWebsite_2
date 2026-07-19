<?php
declare(strict_types=1);

namespace Admin;

use RuntimeException;

final class ImageHandler
{
    private const MAX_BYTES = 5 * 1024 * 1024;
    private const ALLOWED = [
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG => 'png',
        IMAGETYPE_WEBP => 'webp',
    ];

    public function __construct(
        private string $uploadsDir,
        private string $publicBaseUrl,
    ) {
        if (!is_dir($this->uploadsDir)) {
            mkdir($this->uploadsDir, 0755, true);
        }
    }

    /**
     * Validate, strip EXIF by re-encoding, store outside executable PHP paths.
     * @return string Public HTTPS URL
     */
    public function processUpload(array $file): string
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Upload failed.');
        }
        if (($file['size'] ?? 0) > self::MAX_BYTES) {
            throw new RuntimeException('Image must be 5MB or smaller.');
        }
        $tmp = $file['tmp_name'] ?? '';
        if (!is_uploaded_file($tmp)) {
            throw new RuntimeException('Invalid upload.');
        }

        $info = @getimagesize($tmp);
        if ($info === false || !isset(self::ALLOWED[$info[2]])) {
            throw new RuntimeException('Only JPEG, PNG, or WebP images are allowed.');
        }
        $ext = self::ALLOWED[$info[2]];
        $type = $info[2];

        $src = match ($type) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($tmp),
            IMAGETYPE_PNG => imagecreatefrompng($tmp),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? imagecreatefromwebp($tmp) : false,
            default => false,
        };
        if ($src === false) {
            throw new RuntimeException('Could not read image.');
        }

        $w = imagesx($src);
        $h = imagesy($src);
        $dst = imagecreatetruecolor($w, $h);
        if ($type === IMAGETYPE_PNG || $type === IMAGETYPE_WEBP) {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
        }
        imagecopy($dst, $src, 0, 0, 0, 0, $w, $h);
        imagedestroy($src);

        $name = bin2hex(random_bytes(16)) . '.' . $ext;
        $path = rtrim($this->uploadsDir, '/') . '/' . $name;

        $ok = match ($ext) {
            'jpg' => imagejpeg($dst, $path, 88),
            'png' => imagepng($dst, $path, 6),
            'webp' => function_exists('imagewebp') ? imagewebp($dst, $path, 85) : false,
            default => false,
        };
        imagedestroy($dst);

        if (!$ok) {
            throw new RuntimeException('Failed to save processed image.');
        }

        if ($this->publicBaseUrl === '') {
            throw new RuntimeException('IMAGE_PUBLIC_BASE_URL is not configured.');
        }
        return $this->publicBaseUrl . '/' . $name;
    }
}
