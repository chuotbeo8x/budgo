'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
// import Image from 'next/image'; // Removed to avoid image config issues
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Trash2, Search, ArrowLeft } from 'lucide-react';

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
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to load users');
      }
      const data = await res.json();
      setUsers(data?.users || []);
    } catch (e) {
      console.error('Error loading users:', e);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingUsers(true);
        const res = await fetch('/api/debug-users', { cache: 'no-store' });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load users');
        }
        const data = await res.json();
        setUsers(data?.users || []);
      } catch (e) {
        console.error('Error loading users:', e);
        setUsers([]);
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
    // Design System: Clean background, responsive spacing
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header Section - Design System Typography */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Quản lý người dùng
              </h1>
              <p className="text-sm text-gray-600">
                Xem, khóa/mở khóa hoặc xóa tài khoản trong hệ thống
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại Admin
              </Button>
            </Link>
          </div>
        </header>
        {/* Search and Actions - Design System: Responsive layout */}
        <section className="mb-6 lg:mb-8" aria-label="Tìm kiếm và thao tác">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email, username..."
                className="pl-9"
                aria-label="Tìm kiếm người dùng"
              />
            </div>
            <Button 
              variant="secondary" 
              onClick={refreshUsers} 
              disabled={loadingUsers}
              size="sm"
            >
              {loadingUsers ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
        </section>

        {/* Users Table - Design System: Card with proper shadows */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng số: <span className="font-semibold text-gray-900">{users.length}</span> người dùng
              {search.trim() && (
                <span className="ml-2 text-gray-500">(lọc còn {filtered.length})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingUsers ? (
              <div className="py-12 text-center" role="status" aria-label="Đang tải">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-sm text-gray-500">Đang tải danh sách người dùng...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center" role="status" aria-label="Không có dữ liệu">
                <div className="text-sm text-gray-500">
                  {search.trim() ? 'Không tìm thấy người dùng nào' : 'Chưa có người dùng nào'}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" role="table" aria-label="Danh sách người dùng">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left text-sm font-medium text-gray-700 py-4 px-6">Người dùng</th>
                      <th className="text-left text-sm font-medium text-gray-700 py-4 px-6">Email</th>
                      <th className="text-center text-sm font-medium text-gray-700 py-4 px-6">Username</th>
                      <th className="text-center text-sm font-medium text-gray-700 py-4 px-6">Trạng thái</th>
                      <th className="text-center text-sm font-medium text-gray-700 py-4 px-6">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {u.avatar || u.photoURL ? (
                              <img 
                                src={u.avatar || u.photoURL} 
                                alt={u.name || 'avatar'} 
                                width={32} 
                                height={32} 
                                className="rounded-full object-cover border border-gray-200" 
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-500">
                                  {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">{u.name || '(Không tên)'}</div>
                              <div className="text-xs text-gray-500 truncate">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900 truncate" title={u.email}>
                            {u.email || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">
                            {u.username || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Badge 
                              variant={u.role === 'admin' ? 'default' : 'secondary'} 
                              className={`text-xs font-medium ${
                                u.role === 'admin' 
                                  ? 'bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-100' 
                                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {u.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                            {u.disabled ? (
                              <Badge 
                                variant="destructive" 
                                className="text-xs bg-error-100 text-error-700 border-error-200 hover:bg-error-100"
                              >
                                Đã khóa
                              </Badge>
                            ) : (
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-success-100 text-success-700 border-success-200 hover:bg-success-100"
                              >
                                Hoạt động
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {u.disabled ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!!actionLoading[u.id]}
                                onClick={async () => {
                                  setActionLoading((s) => ({ ...s, [u.id]: true }));
                                  try {
                                    const res = await fetch('/api/admin/users/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id }) });
                                    if (!res.ok) throw new Error('Unlock failed');
                                    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, disabled: false } : x));
                                  } catch (e) {
                                    console.error('Error unlocking user:', e);
                                  } finally {
                                    setActionLoading((s) => ({ ...s, [u.id]: false }));
                                  }
                                }}
                              >
                                <Unlock className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Mở khóa</span>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!!actionLoading[u.id] || u.role === 'admin'}
                                onClick={async () => {
                                  setActionLoading((s) => ({ ...s, [u.id]: true }));
                                  try {
                                    const res = await fetch('/api/admin/users/lock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: u.id }) });
                                    if (!res.ok) throw new Error('Lock failed');
                                    setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, disabled: true } : x));
                                  } catch (e) {
                                    console.error('Error locking user:', e);
                                  } finally {
                                    setActionLoading((s) => ({ ...s, [u.id]: false }));
                                  }
                                }}
                              >
                                <Lock className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Khóa</span>
                              </Button>
                            )}
                          <DeleteConfirmDialog
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-error-600 border-error-200 hover:bg-error-50"
                                disabled={!!actionLoading[u.id] || u.role === 'admin'}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Xóa</span>
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
                                console.error('Error deleting user:', e);
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
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <Footer />
      </div>
    </div>
  );
}


