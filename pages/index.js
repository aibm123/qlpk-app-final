import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClinicMedical, faTachometerAlt, faUsers, faCalendarAlt, faPills, faWallet, faRobot, faUserCircle,
    faSignOutAlt, faSpinner, faPlus, faBrain, faPaperPlane, faPaperclip, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HomePage() {
    // --- STATE MANAGEMENT ---
    const [currentUser, setCurrentUser] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [appData, setAppData] = useState({ benhnhan: [], lichhen: [], khothuoc: [], thuchi: [] });
    const [isDataLoading, setIsDataLoading] = useState(true);

    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', pageKey: '', action: '', data: null });
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState('');

    // --- CHATBOT STATE ---
    const [conversations, setConversations] = useState({});
    const [currentThreadId, setCurrentThreadId] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [uploadedImage, setUploadedImage] = useState({ base64: null, preview: null });
    const [isChatSending, setIsChatSending] = useState(false);
    const chatBoxRef = useRef(null);

    // --- LOGIN PERSISTENCE ---
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('qlpk-currentUser');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                setCurrentUser(user);
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('qlpk-currentUser');
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadAllData();
        }
    }, [currentUser]);

    // --- API CALLS (to our proxy) ---
    async function callApi(task, data = {}) {
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, ...data })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Network error: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API call failed for task: ${task}`, error);
            alert(`Thao tác "${task}" thất bại: ${error.message}`);
            return null;
        }
    }

    // --- AUTHENTICATION ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setIsLoading(true);
        const [username, password] = [e.target.username.value.trim(), e.target.password.value.trim()];
        
        const response = await callApi('signin', { name: username, pass: password });

        if (response && Array.isArray(response) && response.length > 0) {
            const user = response[0];
            setCurrentUser(user);
            localStorage.setItem('qlpk-currentUser', JSON.stringify(user));
        } else {
            setLoginError('Tên đăng nhập hoặc mật khẩu không đúng.');
        }
        setIsLoading(false);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('qlpk-currentUser');
        setAppData({ benhnhan: [], lichhen: [], khothuoc: [], thuchi: [] });
        setCurrentPage('dashboard');
    };

    // --- DATA LOADING ---
    const loadAllData = async () => {
        setIsDataLoading(true);
        const rawData = await callApi('getdata');
        const expectedKeys = ['benhnhan', 'lichhen', 'khothuoc', 'thuchi'];
        const loadedData = {};
        if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
            expectedKeys.forEach(key => { loadedData[key] = rawData[key] || []; });
            setAppData(loadedData);
        } else {
            console.error("Failed to load or parse data. Response was not the expected object format:", rawData);
        }
        setIsDataLoading(false);
    };

    // --- PAGE CONFIG ---
    const pageConfig = {
        dashboard: { title: 'Tổng quan', icon: faTachometerAlt },
        benhnhan: { title: 'Bệnh nhân', icon: faUsers, columns: [{h:'Họ và tên',k:'Họ và tên'},{h:'Năm sinh',k:'Năm sinh'},{h:'Giới tính',k:'Giới tính'},{h:'SĐT',k:'Số điện thoại'},{h:'Địa chỉ',k:'Địa chỉ'}] },
        lichhen: { title: 'Lịch hẹn', icon: faCalendarAlt, columns: [{h:'Thời gian',k:'Thời gian'},{h:'Bệnh nhân',k:'Bệnh nhân'},{h:'Lý do khám',k:'Lý do khám'}] },
        khothuoc: { title: 'Kho thuốc', icon: faPills, columns: [{h:'Tên thuốc',k:'Tên thuốc'},{h:'Số lượng',k:'Số lượng'},{h:'Đơn vị',k:'Đơn vị'},{h:'NCC',k:'Nhà cung cấp'},{h:'Công dụng',k:'Công dụng'}] },
        thuchi: { title: 'Thu - Chi', icon: faWallet, columns: [{h:'Loại Giao Dịch',k:'Loại giao dịch'},{h:'Mô tả',k:'Mô tả'},{h:'Số tiền (VND)',k:'Số tiền (VND)'},{h:'Ngày',k:'Ngày'},{h:'Đối Tượng',k:'bệnh nhân/ nhà cung cấp'}] },
        chatbot: { title: 'Chatbot AI', icon: faRobot }
    };

    // --- RENDER LOGIC ---
    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} error={loginError} isLoading={isLoading} />;
    }

    return (
        <>
            <Head>
                <title>Phần Mềm Quản Lý Phòng Khám</title>
                <link rel="icon" href="/favicon.svg" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <div className="h-screen md:flex">
                <Sidebar 
                    user={currentUser} 
                    onLogout={handleLogout} 
                    currentPage={currentPage} 
                    onNavigate={setCurrentPage} 
                    pageConfig={pageConfig} 
                />
                <main id="main-content" className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-100">
                    {isDataLoading 
                        ? <div className="flex justify-center items-center h-full"><FontAwesomeIcon icon={faSpinner} spin size="2x" /><p className="ml-4 text-gray-600">Đang tải dữ liệu...</p></div>
                        : <PageContent 
                            pageKey={currentPage} 
                            appData={appData} 
                            pageConfig={pageConfig} 
                            onAdd={handleAdd} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                            onAiAnalysis={handleAIAnalysis}
                            chatbotProps={{
                                conversations, currentThreadId, chatInput, uploadedImage, isChatSending, chatBoxRef,
                                setChatInput, setUploadedImage, createNewConversation, setCurrentThreadId, sendChatMessage
                            }}
                          />
                    }
                </main>
            </div>
            {isModalOpen && <CrudModal config={modalConfig} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            {isAiModalOpen && <AiAnalysisModal content={aiAnalysisResult} onClose={() => setIsAiModalOpen(false)} />}
        </>
    );

    // --- CRUD & AI HANDLERS ---
    function handleAdd(pageKey) {
        setModalConfig({ title: `Thêm mới ${pageConfig[pageKey].title}`, pageKey, action: 'add', data: {} });
        setIsModalOpen(true);
    }

    function handleEdit(pageKey, row_number) {
        const item = appData[pageKey].find(i => i.row_number === row_number);
        if (!item) return;
        setModalConfig({ title: `Chỉnh sửa ${pageConfig[pageKey].title}`, pageKey, action: 'edit', data: item });
        setIsModalOpen(true);
    }

    async function handleDelete(pageKey, row_number) {
        if (confirm(`Bạn có chắc chắn muốn xóa mục này không?`)) {
            const prompt = `Xóa mục có row_number là ${row_number} khỏi bảng ${pageKey}.`;
            const response = await callApi('CRUD', { prompt });
            if (response && Array.isArray(response) && response[0]?.output) {
                alert(response[0].output);
                await loadAllData();
            } else { alert('Xóa thất bại.'); }
        }
    }

    async function handleSave(formData) {
        const { pageKey, action, row_number } = formData;
        const dataForPrompt = { ...formData };
        delete dataForPrompt.pageKey;
        delete dataForPrompt.action;
        delete dataForPrompt.row_number;
        
        const dataString = Object.entries(dataForPrompt).map(([key, value]) => `${key}: "${value}"`).join(', ');

        let prompt = '';
        if (action === 'add') prompt = `Thêm vào bảng ${pageKey} một mục mới với dữ liệu sau: ${dataString}.`;
        else if (action === 'edit') prompt = `Cập nhật mục có row_number là ${row_number} trong bảng ${pageKey} với dữ liệu mới: ${dataString}.`;

        if (prompt) {
            const response = await callApi('CRUD', { prompt });
            if (response && Array.isArray(response) && response[0]?.output) {
                alert(response[0].output);
                setIsModalOpen(false);
                await loadAllData();
            } else { alert(`Thao tác thất bại.`); }
        }
    }

    async function handleAIAnalysis(pageKey) {
        const dataToAnalyze = appData[pageKey] || [];
        if (dataToAnalyze.length === 0) {
            alert('Không có dữ liệu để phân tích.');
            return;
        }
        setAiAnalysisResult('');
        setIsAiModalOpen(true);

        const prompt = `Phân tích dữ liệu sau đây từ bảng ${pageConfig[pageKey].title} và đưa ra nhận xét, tóm tắt các điểm chính:\n\n${JSON.stringify(dataToAnalyze, null, 2)}`;
        const result = await callApi('analyze', { prompt });
        setAiAnalysisResult(result?.text || 'Phân tích thất bại hoặc không có nội dung trả về.');
    }

    // --- CHATBOT HANDLERS ---
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [conversations, currentThreadId]);

    function createNewConversation() {
        const newThreadId = `thread_${Date.now()}`;
        setConversations(prev => ({ ...prev, [newThreadId]: [] }));
        setCurrentThreadId(newThreadId);
    }

    async function sendChatMessage() {
        if ((!chatInput.trim() && !uploadedImage.base64) || isChatSending) return;
        
        let tempThreadId = currentThreadId;
        if (!tempThreadId) {
            tempThreadId = `thread_${Date.now()}`;
            setConversations(prev => ({ ...prev, [tempThreadId]: [] }));
            setCurrentThreadId(tempThreadId);
        }

        const userPrompt = chatInput.trim() || (uploadedImage.base64 ? "Phân tích hình ảnh này." : "");
        const newUserMessage = { role: 'user', parts: [{ text: userPrompt }] };

        setConversations(prev => ({
            ...prev,
            [tempThreadId]: [...prev[tempThreadId], newUserMessage]
        }));
        setChatInput('');
        setIsChatSending(true);

        let responseText = '';
        if (uploadedImage.base64) {
            const result = await callApi('analyze', { prompt: userPrompt, base64Data: uploadedImage.base64 });
            responseText = result?.text || "Lỗi: Không nhận được phản hồi từ AI.";
            setUploadedImage({ base64: null, preview: null });
        } else {
            const response = await callApi('chatbot', { prompt: userPrompt, threadid: tempThreadId });
            responseText = response && Array.isArray(response) && response[0]?.output ? response[0].output : "Lỗi: Không nhận được phản hồi.";
        }

        const newModelMessage = { role: 'model', parts: [{ text: responseText }] };
        setConversations(prev => ({
            ...prev,
            [tempThreadId]: [...prev[tempThreadId], newModelMessage]
        }));
        setIsChatSending(false);
    }
}

// --- SUB-COMPONENTS ---

function LoginPage({ onLogin, error, isLoading }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Head><title>Đăng Nhập - QLPK</title></Head>
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <FontAwesomeIcon icon={faClinicMedical} size="3x" className="text-teal-600" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Đăng Nhập Hệ Thống</h2>
                    <p className="text-sm text-gray-600">Quản lý phòng khám chuyên nghiệp</p>
                </div>
                <form onSubmit={onLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-gray-700">Tên đăng nhập</label>
                        <input id="username" name="username" type="text" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="admin" defaultValue="admin" />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input id="password" name="password" type="password" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="••••••••" defaultValue="123" />
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 disabled:opacity-50">
                        {isLoading ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" />Đang xử lý...</> : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Sidebar({ user, onLogout, currentPage, onNavigate, pageConfig }) {
    return (
        <div className="sidebar w-64 flex-shrink-0 text-white flex flex-col">
            <div className="px-6 py-4 flex items-center space-x-3 border-b border-gray-700">
                <FontAwesomeIcon icon={faClinicMedical} size="2x" />
                <span className="text-xl font-semibold">QLPK AIBM</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {Object.keys(pageConfig).map(key => (
                    <a href="#" key={key} onClick={(e) => {e.preventDefault(); onNavigate(key);}} className={`sidebar-item flex items-center px-4 py-2.5 rounded-lg ${currentPage === key ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={pageConfig[key].icon} className="w-6" />
                        <span className="ml-3">{pageConfig[key].title}</span>
                    </a>
                ))}
            </nav>
            <div className="px-6 py-4 border-t border-gray-700">
                <div className="flex items-center space-x-3">
                    <FontAwesomeIcon icon={faUserCircle} size="2x" />
                    <div>
                        <p className="font-semibold text-sm">{user.bs}</p>
                        <p className="text-xs text-gray-400">{user.name}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="w-full mt-4 text-left flex items-center px-4 py-2.5 rounded-lg text-sm hover:bg-red-500/80 transition-colors">
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-6" />
                    <span className="ml-3">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}

function PageContent({ pageKey, appData, pageConfig, onAdd, onEdit, onDelete, onAiAnalysis, chatbotProps }) {
    const parseCurrency = (value) => typeof value !== 'string' ? 0 : parseFloat(value.replace(/[^ --]/g, '')) || 0;

    if (pageKey === 'dashboard') {
        const today = new Date();
        const todayString = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
        
        const patientCount = appData.benhnhan?.length || 0;
        const appointmentCountToday = (appData.lichhen || []).filter(h => h['Thời gian']?.startsWith(todayString)).length;
        const medicineCount = appData.khothuoc?.length || 0;
        
        const thuChiData = appData.thuchi || [];

        // Calculate total revenue from all "thu" transactions
        const totalRevenue = thuChiData
            .filter(t => t['Loại giao dịch']?.toLowerCase().includes('thu'))
            .reduce((sum, t) => sum + parseCurrency(t['Số tiền (VND)'] || '0'), 0);

        const hasThuChiData = thuChiData.length > 0;

        // Aggregate transaction values per day for the chart
        const dailyData = {};
        thuChiData.forEach(t => {
            const date = t.Ngày;
            if (!date) return;
            if (!dailyData[date]) {
                dailyData[date] = { thu: 0, chi: 0 };
            }
            const amount = parseCurrency(t['Số tiền (VND)'] || '0');
            if (t['Loại giao dịch']?.toLowerCase().includes('thu')) {
                dailyData[date].thu += amount;
            } else if (t['Loại giao dịch']?.toLowerCase().includes('chi')) {
                dailyData[date].chi += amount;
            }
        });

        const sortedDates = Object.keys(dailyData).sort((a, b) => {
            const [dayA, monthA, yearA] = a.split('/');
            const [dayB, monthB, yearB] = b.split('/');
            return new Date(`${yearA}-${monthA}-${dayA}`) - new Date(`${yearB}-${monthB}-${dayB}`);
        });

        const chartData = {
            labels: hasThuChiData ? sortedDates : ['Không có dữ liệu'],
            datasets: [
                {
                    label: 'Thu',
                    data: hasThuChiData ? sortedDates.map(date => dailyData[date].thu) : [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Chi',
                    data: hasThuChiData ? sortedDates.map(date => dailyData[date].chi) : [],
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.1,
                    fill: true
                }
            ]
        };

        return (
            <>
                <h1 className="text-3xl font-bold mb-6">Bảng điều khiển</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between"><div><p className="text-sm text-gray-500">Tổng Bệnh Nhân</p><p className="text-2xl font-bold">{patientCount}</p></div><FontAwesomeIcon icon={faUsers} size="3x" className="text-blue-500"/></div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between"><div><p className="text-sm text-gray-500">Lịch Hẹn Hôm Nay</p><p className="text-2xl font-bold">{appointmentCountToday}</p></div><FontAwesomeIcon icon={faCalendarAlt} size="3x" className="text-green-500"/></div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between"><div><p className="text-sm text-gray-500">Loại Thuốc</p><p className="text-2xl font-bold">{medicineCount}</p></div><FontAwesomeIcon icon={faPills} size="3x" className="text-yellow-500"/></div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between"><div><p className="text-sm text-gray-500">Tổng Doanh Thu</p><p className="text-2xl font-bold">{new Intl.NumberFormat('vi-VN').format(totalRevenue)} đ</p></div><FontAwesomeIcon icon={faWallet} size="3x" className="text-purple-500"/></div>
                </div>
                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Phân tích Thu-Chi</h2>
                    {hasThuChiData ? (
                        <Line data={chartData} />
                    ) : (
                        <div className="text-center text-gray-500 py-8">Không có dữ liệu thu chi để vẽ biểu đồ.</div>
                    )}
                </div>
            </>
        );
    }

    if (pageKey === 'chatbot') {
        return <Chatbot {...chatbotProps} />;
    }

    // Default table view
    const { columns, title } = pageConfig[pageKey];
    const data = appData[pageKey] || [];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={() => onAdd(pageKey)} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center"><FontAwesomeIcon icon={faPlus} className="mr-2" />Thêm mới</button>
                    <button onClick={() => onAiAnalysis(pageKey)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"><FontAwesomeIcon icon={faBrain} className="mr-2" />Phân tích AI</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                        {columns.map(col => <th key={col.h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.h}</th>) }
                        <th className="px-6 py-3"></th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map(item => (
                            <tr key={item.row_number} className="hover:bg-gray-50">
                                {columns.map(col => <td key={col.k} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item[col.k] || ''}</td>) }
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onEdit(pageKey, item.row_number)} className="text-indigo-600 hover:text-indigo-900">Sửa</button>
                                    <button onClick={() => onDelete(pageKey, item.row_number)} className="text-red-600 hover:text-red-900 ml-4">Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function CrudModal({ config, onClose, onSave }) {
    const [formData, setFormData] = useState(config.data || {});
    const [isSaving, setIsSaving] = useState(false);

    const sanitizeKey = (str) => !str ? '' : str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9_]/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const dataToSave = { ...config.data, ...formData, pageKey: config.pageKey, action: config.action };
        await onSave(dataToSave);
        setIsSaving(false);
    };

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const { columns } = pageConfig[config.pageKey];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{config.title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {columns.map(col => (
                            <div key={col.k}>
                                <label className="block text-sm font-medium text-gray-700">{col.h}</label>
                                <input 
                                    type="text" 
                                    name={sanitizeKey(col.k)}
                                    value={formData[col.k] || ''}
                                    onChange={(e) => handleChange(col.k, e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        ))}
                        <button type="submit" disabled={isSaving} className="w-full bg-teal-600 text-white py-2 rounded-md mt-4 hover:bg-teal-700 disabled:opacity-50">
                            {isSaving ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" />Đang lưu...</> : (config.action === 'add' ? 'Lưu' : 'Cập nhật')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function AiAnalysisModal({ content, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Kết quả Phân tích AI</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto prose max-w-none">
                    {content ? <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} /> : <div className="flex justify-center items-center h-full"><FontAwesomeIcon icon={faSpinner} spin size="2x" /><p className="ml-4 text-gray-600">AI đang phân tích...</p></div>}
                </div>
            </div>
        </div>
    );
}

function Chatbot({ conversations, currentThreadId, chatInput, uploadedImage, isChatSending, chatBoxRef, setChatInput, setUploadedImage, createNewConversation, setCurrentThreadId, sendChatMessage }) {
    
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage({
                base64: e.target.result.split(',')[1],
                preview: e.target.result
            });
        };
        reader.readAsDataURL(file);
    };

    const removeUploadedImage = () => {
        setUploadedImage({ base64: null, preview: null });
        document.getElementById('image-upload-input').value = '';
    };

    const sortedThreads = Object.keys(conversations).sort((a, b) => b.split('_')[1] - a.split('_')[1]);

    return (
        <div className="h-full flex space-x-4">
            <div className="w-1/4 bg-white rounded-lg shadow-md p-4 flex flex-col">
                <h2 className="text-lg font-bold mb-4">Lịch sử hội thoại</h2>
                <button onClick={createNewConversation} className="w-full bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 mb-4 text-sm flex items-center justify-center"><FontAwesomeIcon icon={faPlus} className="mr-2" />Hội thoại mới</button>
                <div className="flex-1 overflow-y-auto">
                    {sortedThreads.map(threadId => {
                        const firstMsg = conversations[threadId]?.[0]?.parts[0]?.text;
                        const preview = firstMsg ? firstMsg.substring(0, 30) + (firstMsg.length > 30 ? '...' : '') : 'Hội thoại mới';
                        const isActive = threadId === currentThreadId;
                        return <button key={threadId} onClick={() => setCurrentThreadId(threadId)} className={`w-full text-left p-2 rounded-md truncate text-sm ${isActive ? 'bg-teal-100 text-teal-800' : 'hover:bg-gray-100'}`}>{preview}</button>
                    }) }
                </div>
            </div>
            <div className="w-3/4 bg-white rounded-lg shadow-md flex flex-col h-full">
                <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto chat-box">
                    {currentThreadId && conversations[currentThreadId] && conversations[currentThreadId].length > 0 ? (
                        conversations[currentThreadId].map((msg, index) => (
                            <div key={index} className={`flex justify-${msg.role === 'user' ? 'end' : 'start'} mb-3`}>
                                <div className={`p-3 rounded-lg max-w-md text-sm ${msg.role === 'user' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`} dangerouslySetInnerHTML={{ __html: msg.parts[0].text.replace(/\n/g, '<br />') }} />
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full text-center text-gray-500"><p>Bắt đầu trò chuyện hoặc tải ảnh lên.</p></div>
                    )}
                    {isChatSending && (
                         <div className="flex justify-start mb-3">
                            <div className="bg-gray-200 p-3 rounded-lg"><FontAwesomeIcon icon={faSpinner} spin /></div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50">
                    {uploadedImage.preview && (
                        <div className="relative w-24 h-24 mb-2">
                            <img src={uploadedImage.preview} className="w-full h-full object-cover rounded-md" />
                            <button onClick={removeUploadedImage} className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"><FontAwesomeIcon icon={faTimes} /></button>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <input type="file" id="image-upload-input" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <button onClick={() => document.getElementById('image-upload-input').click()} title="Đính kèm ảnh" className="bg-gray-200 text-gray-600 rounded-full h-10 w-10 flex items-center justify-center hover:bg-gray-300"><FontAwesomeIcon icon={faPaperclip} /></button>
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()} className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Nhập câu hỏi hoặc mô tả ảnh..." />
                        <button onClick={sendChatMessage} disabled={isChatSending} className="bg-teal-600 text-white rounded-full h-10 w-10 flex items-center justify-center transition-opacity disabled:opacity-50"><FontAwesomeIcon icon={faPaperPlane} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// A simple helper component from the original code
const pageConfig = {
    benhnhan: { columns: [{h:'Họ và tên',k:'Họ và tên'},{h:'Năm sinh',k:'Năm sinh'},{h:'Giới tính',k:'Giới tính'},{h:'SĐT',k:'Số điện thoại'},{h:'Địa chỉ',k:'Địa chỉ'}] },
    lichhen: { columns: [{h:'Thời gian',k:'Thời gian'},{h:'Bệnh nhân',k:'Bệnh nhân'},{h:'Lý do khám',k:'Lý do khám'}] },
    khothuoc: { columns: [{h:'Tên thuốc',k:'Tên thuốc'},{h:'Số lượng',k:'Số lượng'},{h:'Đơn vị',k:'Đơn vị'},{h:'NCC',k:'Nhà cung cấp'},{h:'Công dụng',k:'Công dụng'}] },
    thuchi: { columns: [{h:'Loại Giao Dịch',k:'Loại giao dịch'},{h:'Mô tả',k:'Mô tả'},{h:'Số tiền (VND)',k:'Số tiền (VND)'},{h:'Ngày',k:'Ngày'},{h:'Đối Tượng',k:'bệnh nhân/ nhà cung cấp'}]}
};