export function assertContentTypeForPostAndPatch(req, res, next) {
  if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'GET' || req.method === 'DELETE') {
    if (
      req.headers['Content-Type'] &&
      req.headers['Content-Type'] !== 'application/json' &&
      !req.headers['Content-Type'].startsWith('multipart/form-data;')
    ) {
      return res.status(400).json({ error: 'body must be json or form-data' });
    }
  }
  res.set('Access-Control-Allow-Origin', '*');

  return next();
}
