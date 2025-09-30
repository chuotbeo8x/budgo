'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { useEffect, useMemo, useState } from 'react';
// import Image from 'next/image'; // Removed to avoid image config issues
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Trash2, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const refreshUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/debug-users', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data?.users || []);
    } catch (e) {
      // noop
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingUsers(true);
        const res = await fetch('/api/debug-users', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load users');
        const data = await res.json();
        setUsers(data?.users || []);
      } catch (e) {
        // noop for now
      } finally {
        setLoadingUsers(false);
      }
    };
    if (user && (profile as any)?.role === 'admin') load();
  }, [user, profile]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      return name.includes(q) || email.includes(q) || username.includes(q);
    });
  }, [users, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (profile as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Không có quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Bạn cần quyền quản trị để truy cập khu vực này.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h1>
            <p className="text-sm text-gray-500 mt-1">Xem, khóa/mở khóa hoặc xóa tài khoản trong hệ thống</p>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email, username..."
                className="pl-9"
              />
            </div>
            <Button variant="secondary" onClick={() => { /* no-op, filter realtime */ }}>
              Tìm
            </Button>
          </div>
        </div>

        <Card className="shadow-md">
          <CardHeader className="py-3">
            <CardTitle className="text-sm text-gray-600">
              Tổng số: <span className="font-semibold text-gray-900">{users.length}</span> người dùng
              {search.trim() && (
                <span className="ml-2 text-gray-500">(lọc còn {filtered.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingUsers ? (
              <div className="py-10 text-center text-sm text-gray-500">Đang tải danh sách người dùng...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left text-xs md:text-sm text-gray-600 font-semibold py-3 px-4">Người dùng</th>
                    <th className="text-left text-xs md:text-sm text-gray-600 font-semibold py-3 px-4">Email</th>
                    <th className="text-left text-xs md:text-sm text-gray-600 font-semibold py-3 px-4">Username</th>
                    <th className="text-center text-xs md:text-sm text-gray-600 font-semibold py-3 px-4">Trạng thái</th>
                    <th className="text-center text-xs md:text-sm text-gray-600 font-semibold py-3 px-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">
                        <div className="flex items-center gap-3">
                          {u.avatar || u.photoURL ? (
                            <img src={u.avatar || u.photoURL} alt={u.name || 'avatar'} width={28} height={28} className="rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-200" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{u.name || '(Không tên)'}</div>
                            <div className="text-[11px] text-gray-500 truncate">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 truncate" title={u.email}>{u.email || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{u.username || '-'}</td>
                      <td className="py-3 px-4 text-center text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="uppercase tracking-wide">
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </Badge>
                          {u.disabled && (
                            <span className="px-2 py-1 rounded-full text-[10px] bg-red-100 text-red-700">Đã khóa</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-xs">
                        <div className="flex items-center justify-center gap-1">
                          {u.disabled ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={!!actionLoading[u.id]}
                              onClick={async () => {
                                setActionLoading((s) => ({ ...s, [u.id]: true }));
                                try {
                                  const res = await fetch('/api/admin/users/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id }) });
                                  if (!res.ok) throw new Error('Unlock failed');
                                  // Update local state
                                  setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, disabled: false } : x));
                                } catch (e) {
                                  // noop
                                } finally {
                                  setActionLoading((s) => ({ ...s, [u.id]: false }));
                                }
                              }}
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              <span className="hidden md:inline">Mở khóa</span>
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={!!actionLoading[u.id] || u.role === 'admin'}
                              onClick={async () => {
                                setActionLoading((s) => ({ ...s, [u.id]: true }));
                                try {
                                  const res = await fetch('/api/admin/users/lock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id }) });
                                  if (!res.ok) throw new Error('Lock failed');
                                  setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, disabled: true } : x));
                                } catch (e) {
                                  // noop
                                } finally {
                                  setActionLoading((s) => ({ ...s, [u.id]: false }));
                                }
                              }}
                            >
                              <Lock className="w-4 h-4 mr-1" />
                              <span className="hidden md:inline">Khóa</span>
                            </Button>
                          )}
                          <DeleteConfirmDialog
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                disabled={!!actionLoading[u.id] || u.role === 'admin'}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="hidden md:inline">Xóa</span>
                              </Button>
                            }
                            title="Xóa người dùng"
                            description="Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
                            confirmText="Xóa"
                            cancelText="Hủy"
                            onConfirm={async () => {
                              setActionLoading((s) => ({ ...s, [u.id]: true }));
                              try {
                                const res = await fetch(`/api/admin/users/delete?userId=${encodeURIComponent(u.id)}`, { method: 'DELETE' });
                                if (!res.ok) throw new Error('Delete failed');
                                setUsers((prev) => prev.filter((x) => x.id !== u.id));
                              } catch (e) {
                                // noop
                              } finally {
                                setActionLoading((s) => ({ ...s, [u.id]: false }));
                              }
                            }}
                            loadingText="Đang xóa..."
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="py-8 text-center text-sm text-gray-500" colSpan={5}>Không có người dùng nào phù hợp</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


