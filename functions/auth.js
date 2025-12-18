
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return jsonResponse({ message: "Champs manquants" }, 400);
    }

    // Query user
    const user = await env.DB
      .prepare(
        "SELECT id, email, password_hash, status FROM users WHERE email = ?"
      )
      .bind(email)
      .first();

    if (!user) {
      return jsonResponse({ message: "Compte introuvable" }, 401);
    }

    // Verify password (simple hash v1)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashHex = [...new Uint8Array(hashBuffer)]
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    if (hashHex !== user.password_hash) {
      return jsonResponse({ message: "Mot de passe incorrect" }, 401);
    }

    // User exists but payment not validated
    if (user.status !== "active") {
      return jsonResponse({ status: "pending" }, 200);
    }

    // Generate session token
    const token = crypto.randomUUID();

    // Store token
    await env.DB
      .prepare(
        "UPDATE users SET session_token = ?, last_login = CURRENT_TIMESTAMP WHERE id = ?"
      )
      .bind(token, user.id)
      .run();

    return jsonResponse({
      status: "active",
      token
    }, 200);

  } catch (err) {
    return jsonResponse({ message: "Erreur serveur" }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
