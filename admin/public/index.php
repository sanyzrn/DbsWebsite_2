<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
$auth->requireLogin();

$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_csrf($auth);
    $action = $_POST['action'] ?? '';
    $id = (int) ($_POST['id'] ?? 0);
    try {
        if ($action === 'toggle_featured' && $id) {
            $p = $projects->find($id);
            if ($p) {
                $projects->setFeatured($id, !$p['featured']);
            }
            header('Content-Type: application/json');
            echo json_encode(['ok' => true]);
            exit;
        }
        if ($action === 'set_order' && $id) {
            $projects->setOrder($id, (int) ($_POST['order'] ?? 0));
            header('Content-Type: application/json');
            echo json_encode(['ok' => true]);
            exit;
        }
        if ($action === 'delete' && $id) {
            $projects->delete($id);
            $_SESSION['flash'] = 'Project deleted (publish to remove JSON from GitHub).';
            header('Location: index.php');
            exit;
        }
    } catch (Throwable $e) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

$rows = $projects->all();
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Projects dashboard</title>
  <link rel="stylesheet" href="assets/admin.css" />
</head>
<body>
  <header class="top">
    <strong>Projects</strong>
    <nav>
      <a href="project-edit.php">New project</a>
      <a href="publish.php">Publish</a>
      <form method="post" action="logout.php" class="inline">
        <input type="hidden" name="_csrf" value="<?= h($auth->csrfToken()) ?>" />
        <button type="submit" class="linkish">Log out</button>
      </form>
    </nav>
  </header>

  <?php if ($flash): ?><p class="flash"><?= h($flash) ?></p><?php endif; ?>

  <main class="wrap">
    <table class="grid">
      <thead>
        <tr>
          <th>Order</th>
          <th>Thumb</th>
          <th>Slug</th>
          <th>Name (fa)</th>
          <th>Status</th>
          <th>Featured</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($rows as $p): ?>
          <tr data-id="<?= (int) $p['id'] ?>">
            <td>
              <input type="number" class="order-input" value="<?= (int) $p['display_order'] ?>" style="width:4.5rem" />
            </td>
            <td>
              <?php if ($p['image_url']): ?>
                <img src="<?= h($p['image_url']) ?>" alt="" class="thumb" />
              <?php else: ?>
                <span class="muted">—</span>
              <?php endif; ?>
            </td>
            <td><code><?= h($p['slug']) ?></code></td>
            <td><?= h($p['name_fa']) ?></td>
            <td><span class="badge"><?= h($p['status']) ?></span></td>
            <td>
              <button type="button" class="featured-toggle" data-on="<?= $p['featured'] ? '1' : '0' ?>">
                <?= $p['featured'] ? '★' : '☆' ?>
              </button>
            </td>
            <td class="actions">
              <a href="project-edit.php?id=<?= (int) $p['id'] ?>">Edit</a>
              <form method="post" class="inline" onsubmit="return confirm('Delete this project from the database?');">
                <input type="hidden" name="_csrf" value="<?= h($auth->csrfToken()) ?>" />
                <input type="hidden" name="action" value="delete" />
                <input type="hidden" name="id" value="<?= (int) $p['id'] ?>" />
                <button type="submit" class="linkish danger">Delete</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </main>
  <script>
    const csrf = <?= json_encode($auth->csrfToken()) ?>;
    async function post(body) {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => fd.append(k, v));
      fd.append('_csrf', csrf);
      const res = await fetch('index.php', { method: 'POST', body: fd, headers: { 'X-CSRF-Token': csrf } });
      return res.json();
    }
    document.querySelectorAll('.featured-toggle').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        await post({ action: 'toggle_featured', id });
        location.reload();
      });
    });
    document.querySelectorAll('.order-input').forEach((input) => {
      input.addEventListener('blur', async () => {
        const id = input.closest('tr').dataset.id;
        await post({ action: 'set_order', id, order: input.value });
      });
    });
  </script>
</body>
</html>
