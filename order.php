<?php
// order.php — Tar emot beställningar och skickar e-post till ansvarig
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) {
  // Fallback: hantera form-urlencoded
  $data = $_POST;
}

if (isset($data['_hp']) && $data['_hp'] !== '') {
  http_response_code(200);
  echo json_encode(['ok' => true, 'spam' => true]);
  exit;
}

function sanitize($key) {
  return htmlspecialchars(trim($_POST[$key] ?? ($_GET[$key] ?? '')), ENT_QUOTES, 'UTF-8');
}

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$variant = $data['variant'] ?? '';
$qty = intval($data['qty'] ?? 1);
$coupon = $data['coupon'] ?? '';
$address = $data['address'] ?? '';
$zip = $data['zip'] ?? '';
$city = $data['city'] ?? '';

if (!$name || !$email || !$address || !$zip || !$city) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Saknar obligatoriska fält.']);
  exit;
}

$to = 'dawn@odqvist.se';
$subject = 'Ny beställning via webbplatsen';
$body = "Namn: $name
E-post: $email
Variant: $variant
Antal: $qty
Kupong: $coupon
Adress: $address
Postnummer: $zip
Ort: $city
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

