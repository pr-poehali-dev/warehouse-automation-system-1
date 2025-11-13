import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface Request {
  id: number;
  request_type: string;
  status: string;
  contractor_id: number | null;
  operator_id: number | null;
  notes: string | null;
  created_at: string;
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState<Request[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      loadData();
    }
  }, [isLoggedIn, currentUser]);

  const loadData = async () => {
    try {
      const [reqRes, prodRes, contrRes, orderRes, zoneRes] = await Promise.all([
        fetch('/api/requests').catch(() => ({ ok: false })),
        fetch('/api/products').catch(() => ({ ok: false })),
        fetch('/api/contractors').catch(() => ({ ok: false })),
        fetch('/api/orders').catch(() => ({ ok: false })),
        fetch('/api/zones').catch(() => ({ ok: false }))
      ]);

      if (reqRes.ok) setRequests(await reqRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (contrRes.ok) setContractors(await contrRes.json());
      if (orderRes.ok) setOrders(await orderRes.json());
      if (zoneRes.ok) setZones(await zoneRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    setCurrentUser({
      id: 1,
      email: email,
      full_name: 'Оператор Склада',
      role: 'operator'
    });
    setIsLoggedIn(true);
    toast({ title: 'Добро пожаловать!', description: 'Вы успешно вошли в систему' });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const role = formData.get('role') as string || 'client';
    
    setCurrentUser({
      id: 2,
      email: email,
      full_name: formData.get('full_name') as string,
      role: role
    });
    setIsLoggedIn(true);
    toast({ title: 'Регистрация успешна!', description: `Вы зарегистрированы как ${role === 'operator' ? 'Оператор' : role === 'supplier' ? 'Поставщик' : 'Покупатель'}` });
  };

  const createRequest = (type: string) => {
    const newRequest: Request = {
      id: requests.length + 1,
      request_type: type,
      status: 'pending',
      contractor_id: null,
      operator_id: currentUser?.id || null,
      notes: null,
      created_at: new Date().toISOString()
    };
    setRequests([...requests, newRequest]);
    toast({ title: 'Заявка создана', description: `Заявка на ${type === 'receiving' ? 'приемку' : type === 'shipping' ? 'отгрузку' : 'инвентаризацию'} создана` });
  };

  const updateRequestStatus = (id: number, status: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    toast({ title: 'Статус обновлен', description: `Статус заявки #${id} изменен на ${status}` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидание';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary text-white p-4 rounded-2xl">
                <Icon name="Package" size={40} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">СкладПро</CardTitle>
            <CardDescription>Система управления складом</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input id="login-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full">Войти</Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Полное имя</Label>
                    <Input id="register-name" name="full_name" placeholder="Иван Иванов" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <Input id="register-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-role">Роль</Label>
                    <Select name="role" defaultValue="client">
                      <SelectTrigger id="register-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Покупатель</SelectItem>
                        <SelectItem value="operator">Оператор склада</SelectItem>
                        <SelectItem value="supplier">Поставщик</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Зарегистрироваться</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
              <Icon name="Package" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">СкладПро</h1>
              <p className="text-xs text-sidebar-foreground/70">{currentUser?.full_name}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon name="LayoutDashboard" size={20} />
            <span>Дашборд</span>
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'products' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon name="Box" size={20} />
            <span>Товары</span>
          </button>
          
          {currentUser?.role === 'operator' && (
            <>
              <button
                onClick={() => setActiveTab('receiving')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'receiving' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name="PackageCheck" size={20} />
                <span>Приемка</span>
              </button>
              
              <button
                onClick={() => setActiveTab('shipping')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'shipping' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name="Truck" size={20} />
                <span>Отгрузка</span>
              </button>
              
              <button
                onClick={() => setActiveTab('warehouse')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'warehouse' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name="Warehouse" size={20} />
                <span>Склад</span>
              </button>
              
              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'inventory' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name="ClipboardList" size={20} />
                <span>Инвентаризация</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'orders' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon name="ShoppingCart" size={20} />
            <span>Заказы</span>
          </button>
          
          <button
            onClick={() => setActiveTab('contractors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'contractors' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon name="Users" size={20} />
            <span>Контрагенты</span>
          </button>
          
          {currentUser?.role === 'operator' && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'reports' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon name="BarChart3" size={20} />
              <span>Отчеты</span>
            </button>
          )}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setIsLoggedIn(false);
              setCurrentUser(null);
              toast({ title: 'Выход', description: 'Вы вышли из системы' });
            }}
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Дашборд</h2>
              <p className="text-muted-foreground">Общая статистика склада</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
                  <Icon name="Package" size={20} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{products.length || 3}</div>
                  <p className="text-xs text-muted-foreground mt-1">номенклатурных позиций</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Активные заявки</CardTitle>
                  <Icon name="FileText" size={20} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{requests.filter(r => r.status !== 'completed').length}</div>
                  <p className="text-xs text-muted-foreground mt-1">требуют обработки</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Складские зоны</CardTitle>
                  <Icon name="Warehouse" size={20} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{zones.length || 3}</div>
                  <p className="text-xs text-muted-foreground mt-1">зон в эксплуатации</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Заказы</CardTitle>
                  <Icon name="ShoppingCart" size={20} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orders.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">активных заказов</p>
                </CardContent>
              </Card>
            </div>

            {currentUser?.role === 'operator' && (
              <Card>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                  <CardDescription>Создать новую заявку</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button onClick={() => createRequest('receiving')} className="flex-1">
                      <Icon name="PackageCheck" size={16} className="mr-2" />
                      Приемка
                    </Button>
                    <Button onClick={() => createRequest('shipping')} className="flex-1">
                      <Icon name="Truck" size={16} className="mr-2" />
                      Отгрузка
                    </Button>
                    <Button onClick={() => createRequest('inventory')} className="flex-1">
                      <Icon name="ClipboardList" size={16} className="mr-2" />
                      Инвентаризация
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Последние заявки</CardTitle>
                <CardDescription>История операций</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Нет заявок
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.slice(-5).reverse().map(req => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">#{req.id}</TableCell>
                          <TableCell>
                            {req.request_type === 'receiving' ? 'Приемка' : 
                             req.request_type === 'shipping' ? 'Отгрузка' : 'Инвентаризация'}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(req.status)}>
                              {getStatusText(req.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleDateString('ru-RU')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Товары</h2>
                <p className="text-muted-foreground">Номенклатура склада</p>
              </div>
              <Button>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить товар
              </Button>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Наименование</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Единица</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">SKU001</TableCell>
                      <TableCell>Ноутбук Dell XPS</TableCell>
                      <TableCell>Электроника</TableCell>
                      <TableCell>шт</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">SKU002</TableCell>
                      <TableCell>Холодильник LG</TableCell>
                      <TableCell>Бытовая техника</TableCell>
                      <TableCell>шт</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">SKU003</TableCell>
                      <TableCell>Кофе Lavazza</TableCell>
                      <TableCell>Продукты питания</TableCell>
                      <TableCell>кг</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'receiving' && currentUser?.role === 'operator' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Приемка</h2>
                <p className="text-muted-foreground">Управление приемкой товаров</p>
              </div>
              <Button onClick={() => createRequest('receiving')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать заявку
              </Button>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.filter(r => r.request_type === 'receiving').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Нет заявок на приемку
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.filter(r => r.request_type === 'receiving').map(req => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">#{req.id}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(req.status)}>
                              {getStatusText(req.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleDateString('ru-RU')}</TableCell>
                          <TableCell>
                            <Select value={req.status} onValueChange={(val) => updateRequestStatus(req.id, val)}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Ожидание</SelectItem>
                                <SelectItem value="in_progress">В работе</SelectItem>
                                <SelectItem value="completed">Завершено</SelectItem>
                                <SelectItem value="cancelled">Отменено</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'shipping' && currentUser?.role === 'operator' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Отгрузка</h2>
                <p className="text-muted-foreground">Управление отгрузкой товаров</p>
              </div>
              <Button onClick={() => createRequest('shipping')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Создать заявку
              </Button>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.filter(r => r.request_type === 'shipping').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Нет заявок на отгрузку
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.filter(r => r.request_type === 'shipping').map(req => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">#{req.id}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(req.status)}>
                              {getStatusText(req.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleDateString('ru-RU')}</TableCell>
                          <TableCell>
                            <Select value={req.status} onValueChange={(val) => updateRequestStatus(req.id, val)}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Ожидание</SelectItem>
                                <SelectItem value="in_progress">В работе</SelectItem>
                                <SelectItem value="completed">Завершено</SelectItem>
                                <SelectItem value="cancelled">Отменено</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'warehouse' && currentUser?.role === 'operator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Склад</h2>
              <p className="text-muted-foreground">Управление складскими зонами</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Download" size={20} />
                    Зона А - Приемка
                  </CardTitle>
                  <CardDescription>Зона приемки товаров</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Вместимость:</span>
                      <span className="font-medium">1000 ед.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Заполнено:</span>
                      <span className="font-medium">320 ед.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Archive" size={20} />
                    Зона Б - Хранение
                  </CardTitle>
                  <CardDescription>Основная зона хранения</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Вместимость:</span>
                      <span className="font-medium">5000 ед.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Заполнено:</span>
                      <span className="font-medium">3840 ед.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Upload" size={20} />
                    Зона В - Отгрузка
                  </CardTitle>
                  <CardDescription>Зона подготовки к отгрузке</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Вместимость:</span>
                      <span className="font-medium">800 ед.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Заполнено:</span>
                      <span className="font-medium">156 ед.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && currentUser?.role === 'operator' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Инвентаризация</h2>
                <p className="text-muted-foreground">Проведение инвентаризации</p>
              </div>
              <Button onClick={() => createRequest('inventory')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Начать инвентаризацию
              </Button>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.filter(r => r.request_type === 'inventory').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          Нет инвентаризаций
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.filter(r => r.request_type === 'inventory').map(req => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">#{req.id}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(req.status)}>
                              {getStatusText(req.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleDateString('ru-RU')}</TableCell>
                          <TableCell>
                            <Select value={req.status} onValueChange={(val) => updateRequestStatus(req.id, val)}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Ожидание</SelectItem>
                                <SelectItem value="in_progress">В работе</SelectItem>
                                <SelectItem value="completed">Завершено</SelectItem>
                                <SelectItem value="cancelled">Отменено</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Заказы</h2>
                <p className="text-muted-foreground">Управление заказами</p>
              </div>
              {currentUser?.role === 'client' && (
                <Button>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Создать заказ
                </Button>
              )}
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  Нет заказов
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'contractors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold">Контрагенты</h2>
                <p className="text-muted-foreground">Поставщики и клиенты</p>
              </div>
              <Button>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить контрагента
              </Button>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  Нет контрагентов
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'reports' && currentUser?.role === 'operator' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Отчеты</h2>
              <p className="text-muted-foreground">Аналитика и статистика</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Отчет по приемке</CardTitle>
                  <CardDescription>Статистика приемки за период</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Icon name="Download" size={16} className="mr-2" />
                    Сформировать отчет
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Отчет по отгрузке</CardTitle>
                  <CardDescription>Статистика отгрузки за период</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Icon name="Download" size={16} className="mr-2" />
                    Сформировать отчет
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Отчет по остаткам</CardTitle>
                  <CardDescription>Текущие остатки на складе</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Icon name="Download" size={16} className="mr-2" />
                    Сформировать отчет
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Отчет по инвентаризации</CardTitle>
                  <CardDescription>Результаты инвентаризаций</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Icon name="Download" size={16} className="mr-2" />
                    Сформировать отчет
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
