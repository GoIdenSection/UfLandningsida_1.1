<?php
// contact.php — Tar emot kontaktmeddelanden och skickar e-post till ansvarig
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) {
  $data = $_POST;
}

if (isset($data['_hp']) && $data['_hp'] !== '') {
  http_response_code(200);
  echo json_encode(['ok' => true, 'spam' => true]);
  exit;
}

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$message = $data['message'] ?? '';

if (!$name || !$email || !$message) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Saknar obligatoriska fält.']);
  exit;
}

$to = 'dawn@odqvist.se';
$subject = 'Nytt kontaktmeddelande från webbplatsen';
$body = "Namn: $name
E-post: $email
Meddelande:
$message

Tid: " . date('Y-m-d H:i');

$headers = "From: noreply@{$_SERVER['SERVER_NAME']}
" .
           "Reply-To: $email
" .
           "Content-Type: text/plain; charset=UTF-8
";

$mail_ok = @mail($to, $subject, $body, $headers);

if ($mail_ok) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Kunde inte skicka e-post (mail()).']);
}
?>
