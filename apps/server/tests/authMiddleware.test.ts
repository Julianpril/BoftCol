import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { createAuthMiddleware } from '../src/middleware/authMiddleware.js';

const SECRET = 'test-secret-32-chars-long-enough!';
const requireAdmin = createAuthMiddleware(SECRET);

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() } as any;
  res.status.mockReturnValue(res);
  return res;
}

describe('requireAdmin middleware', () => {
  it('returns 401 when Authorization header is missing', () => {
    const req = { headers: {} } as any;
    const res = makeRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is malformed', () => {
    const req = { headers: { authorization: 'Bearer not-a-jwt' } } as any;
    const res = makeRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is signed with wrong secret', () => {
    const token = jwt.sign({ adminId: 'abc' }, 'wrong-secret');
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = makeRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token is expired', () => {
    const token = jwt.sign({ adminId: 'abc' }, SECRET, { expiresIn: -1 });
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = makeRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next() and sets req.adminId when token is valid', () => {
    const token = jwt.sign({ adminId: 'admin-uuid-123' }, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = makeRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.adminId).toBe('admin-uuid-123');
  });
});
