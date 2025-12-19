export default {
  async fetch(request, env) {
    const res = await env.TESSYS_LMS_DB
      .prepare("SELECT * FROM admins")
      .all();

    return new Response(JSON.stringify(res.results), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
