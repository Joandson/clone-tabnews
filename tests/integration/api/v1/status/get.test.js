test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch(
    "https://clone-tabnews-u8me.vercel.app/api/v1/status",
  );
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

  expect(responseBody.dependencies.database.version).toEqual("16.8");
  expect(responseBody.dependencies.database.max_connections).toEqual(901);
  expect(responseBody.dependencies.database.opened_connections).toEqual(0);
});
