export default {
  async fetch(request, env) {
    const res = await env.tessys_lms_db

      .prepare("SELECT * FROM admins")
      .all();

    return new Response(JSON.stringify(res.results), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
