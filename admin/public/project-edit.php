<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
$auth->requireLogin();

$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$project = $id ? $projects->find($id) : null;
$errors = [];
$saved = false;

function blank_project(): array
{
    return [
        'slug' => '',
        'status' => 'concept',
        'featured' => false,
        'display_order' => 0,
        'name_fa' => '',
        'name_en' => '',
        'subtitle_fa' => '',
        'subtitle_en' => '',
        'desc_fa' => '',
        'desc_en' => '',
        'problem_fa' => '',
        'problem_en' => '',
        'approach_fa' => '',
        'approach_en' => '',
        'result_fa' => '',
        'result_en' => '',
        'role_fa' => [],
        'role_en' => [],
        'tech' => [],
        'tags' => [],
        'image_url' => null,
        'mock' => '',
        'caps_fa' => [],
        'caps_en' => [],
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf($auth);
    $data = [
        'slug' => strtolower(trim((string) ($_POST['slug'] ?? ''))),
        'status' => (string) ($_POST['status'] ?? 'concept'),
        'featured' => !empty($_POST['featured']),
        'display_order' => (int) ($_POST['display_order'] ?? 0),
        'name_fa' => trim((string) ($_POST['name_fa'] ?? '')),
        'name_en' => trim((string) ($_POST['name_en'] ?? '')),
        'subtitle_fa' => trim((string) ($_POST['subtitle_fa'] ?? '')),
        'subtitle_en' => trim((string) ($_POST['subtitle_en'] ?? '')),
        'desc_fa' => trim((string) ($_POST['desc_fa'] ?? '')),
        'desc_en' => trim((string) ($_POST['desc_en'] ?? '')),
        'problem_fa' => trim((string) ($_POST['problem_fa'] ?? '')),
        'problem_en' => trim((string) ($_POST['problem_en'] ?? '')),
        'approach_fa' => trim((string) ($_POST['approach_fa'] ?? '')),
        'approach_en' => trim((string) ($_POST['approach_en'] ?? '')),
        'result_fa' => trim((string) ($_POST['result_fa'] ?? '')),
        'result_en' => trim((string) ($_POST['result_en'] ?? '')),
        'role_fa' => lines_to_array((string) ($_POST['role_fa'] ?? '')),
        'role_en' => lines_to_array((string) ($_POST['role_en'] ?? '')),
        'tech' => lines_to_array((string) ($_POST['tech'] ?? '')),
        'tags' => lines_to_array((string) ($_POST['tags'] ?? '')),
        'image_url' => trim((string) ($_POST['image_url'] ?? '')) ?: null,
        'mock' => trim((string) ($_POST['mock'] ?? '')),
        'caps_fa' => lines_to_array((string) ($_POST['caps_fa'] ?? '')),
        'caps_en' => lines_to_array((string) ($_POST['caps_en'] ?? '')),
    ];
    try {
        if ($id) {
            $projects->update($id, $data);
        } else {
            $id = $projects->create($data);
        }
        $saved = true;
        $project = $projects->find($id);
    } catch (InvalidArgumentException $e) {
        $decoded = json_decode($e->getMessage(), true);
        $errors = is_array($decoded) ? $decoded : ['form' => $e->getMessage()];
        $project = array_merge($project ?? blank_project(), $data);
    } catch (Throwable $e) {
        $errors = ['form' => $e->getMessage()];
        $project = array_merge($project ?? blank_project(), $data);
    }
}

$p = $project ?? blank_project();
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= $id ? 'Edit' : 'New' ?> project</title>
  <link rel="stylesheet" href="assets/admin.css" />
</head>
<body>
  <header class="top">
    <a href="index.php">← Dashboard</a>
    <strong><?= $id ? 'Edit project' : 'New project' ?></strong>
  </header>
  <main class="wrap narrow">
    <?php if ($saved): ?><p class="flash">Saved to database. Use Publish to push JSON to GitHub.</p><?php endif; ?>
    <?php if (!empty($errors['form'])): ?><p class="error"><?= h($errors['form']) ?></p><?php endif; ?>

    <form method="post" class="stack" enctype="multipart/form-data" id="edit-form">
      <input type="hidden" name="_csrf" value="<?= h($auth->csrfToken()) ?>" />

      <div class="row2">
        <label>Slug<?= isset($errors['slug']) ? ' <span class="error">' . h($errors['slug']) . '</span>' : '' ?>
          <input name="slug" value="<?= h($p['slug']) ?>" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
        </label>
        <label>Status
          <select name="status">
            <option value="production" <?= $p['status'] === 'production' ? 'selected' : '' ?>>production</option>
            <option value="concept" <?= $p['status'] === 'concept' ? 'selected' : '' ?>>concept</option>
          </select>
        </label>
      </div>

      <div class="row2">
        <label>Display order
          <input type="number" name="display_order" value="<?= (int) $p['display_order'] ?>" />
        </label>
        <label class="check"><input type="checkbox" name="featured" value="1" <?= !empty($p['featured']) ? 'checked' : '' ?> /> Featured</label>
      </div>

      <div class="row2">
        <label>Name (fa)<?= isset($errors['name_fa']) ? ' <span class="error">' . h($errors['name_fa']) . '</span>' : '' ?>
          <input name="name_fa" value="<?= h($p['name_fa']) ?>" required dir="rtl" />
        </label>
        <label>Name (en)<?= isset($errors['name_en']) ? ' <span class="error">' . h($errors['name_en']) . '</span>' : '' ?>
          <input name="name_en" value="<?= h($p['name_en']) ?>" required />
        </label>
      </div>

      <div class="row2">
        <label>Subtitle (fa)<textarea name="subtitle_fa" rows="2" dir="rtl"><?= h($p['subtitle_fa'] ?? '') ?></textarea></label>
        <label>Subtitle (en)<textarea name="subtitle_en" rows="2"><?= h($p['subtitle_en'] ?? '') ?></textarea></label>
      </div>

      <div class="row2">
        <label>Description (fa)<textarea name="desc_fa" rows="5" dir="rtl"><?= h($p['desc_fa'] ?? '') ?></textarea></label>
        <label>Description (en)<textarea name="desc_en" rows="5"><?= h($p['desc_en'] ?? '') ?></textarea></label>
      </div>

      <div class="row2">
        <label>Problem (fa)<textarea name="problem_fa" rows="3" dir="rtl"><?= h($p['problem_fa'] ?? '') ?></textarea></label>
        <label>Problem (en)<textarea name="problem_en" rows="3"><?= h($p['problem_en'] ?? '') ?></textarea></label>
      </div>
      <div class="row2">
        <label>Approach (fa)<textarea name="approach_fa" rows="3" dir="rtl"><?= h($p['approach_fa'] ?? '') ?></textarea></label>
        <label>Approach (en)<textarea name="approach_en" rows="3"><?= h($p['approach_en'] ?? '') ?></textarea></label>
      </div>
      <div class="row2">
        <label>Result (fa)<textarea name="result_fa" rows="3" dir="rtl"><?= h($p['result_fa'] ?? '') ?></textarea></label>
        <label>Result (en)<textarea name="result_en" rows="3"><?= h($p['result_en'] ?? '') ?></textarea></label>
      </div>

      <div class="row2">
        <label>Role (fa) — one per line<textarea name="role_fa" rows="4" dir="rtl"><?= h(array_to_lines($p['role_fa'] ?? [])) ?></textarea></label>
        <label>Role (en) — one per line<textarea name="role_en" rows="4"><?= h(array_to_lines($p['role_en'] ?? [])) ?></textarea></label>
      </div>

      <div class="row2">
        <label>Tech — one per line<textarea name="tech" rows="4"><?= h(array_to_lines($p['tech'] ?? [])) ?></textarea></label>
        <label>Tags — one per line<textarea name="tags" rows="4"><?= h(array_to_lines($p['tags'] ?? [])) ?></textarea></label>
      </div>

      <div class="row2">
        <label>Caps (fa) — optional<textarea name="caps_fa" rows="4" dir="rtl"><?= h(array_to_lines($p['caps_fa'] ?? [])) ?></textarea></label>
        <label>Caps (en) — optional<textarea name="caps_en" rows="4"><?= h(array_to_lines($p['caps_en'] ?? [])) ?></textarea></label>
      </div>

      <div class="row2">
        <label>Mock key (optional UI screenshot)
          <input name="mock" value="<?= h($p['mock'] ?? '') ?>" placeholder="pulse" />
        </label>
        <label>Image URL
          <input name="image_url" id="image_url" value="<?= h($p['image_url'] ?? '') ?>" />
        </label>
      </div>

      <?php if ($id): ?>
        <fieldset class="upload">
          <legend>Upload image</legend>
          <input type="file" id="image_file" accept="image/jpeg,image/png,image/webp" />
          <button type="button" id="upload_btn">Upload &amp; re-encode</button>
          <p class="muted" id="upload_msg"></p>
          <?php if (!empty($p['image_url'])): ?>
            <img src="<?= h($p['image_url']) ?>" alt="" class="preview" />
          <?php endif; ?>
        </fieldset>
      <?php endif; ?>

      <button type="submit">Save</button>
    </form>
  </main>
  <?php if ($id): ?>
  <script>
    const csrf = <?= json_encode($auth->csrfToken()) ?>;
    document.getElementById('upload_btn').addEventListener('click', async () => {
      const file = document.getElementById('image_file').files[0];
      const msg = document.getElementById('upload_msg');
      if (!file) { msg.textContent = 'Choose a file first.'; return; }
      const fd = new FormData();
      fd.append('image', file);
      fd.append('project_id', <?= (int) $id ?>);
      fd.append('_csrf', csrf);
      msg.textContent = 'Uploading…';
      const res = await fetch('upload-image.php', { method: 'POST', body: fd, headers: { 'X-CSRF-Token': csrf } });
      const data = await res.json();
      if (!data.ok) { msg.textContent = data.error || 'Upload failed'; return; }
      document.getElementById('image_url').value = data.url;
      msg.textContent = 'Uploaded.';
    });
  </script>
  <?php endif; ?>
</body>
</html>
