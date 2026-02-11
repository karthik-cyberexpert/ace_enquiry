import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { 
  Search, 
  Download, 
  LogOut, 
  Users, 
  Calendar, 
  FileText,
  X,
  FileDown
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Enquiry {
  id: string
  name: string
  email: string
  phone: string
  course: string
  branch: string
  queries: string
  timestamp: string
}


const AdminDashboard = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<Enquiry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('All')
  const [selectedYear, setSelectedYear] = useState('All')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)

  // Authentication Check
  useEffect(() => {
    const auth = localStorage.getItem('isAdminAuthenticated')
    if (auth !== 'true') {
      navigate('/enquiryform/login')
    }
    fetchData()
  }, [navigate])

  const fetchData = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.append('search', searchTerm)
    if (selectedBranch !== 'All') params.append('branch', selectedBranch)
    if (selectedYear !== 'All') params.append('year', selectedYear)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    fetch(`/api/enquiries?${params.toString()}`)
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Error fetching data:', err))
  }

  // Refetch when filters change
  useEffect(() => {
    fetchData()
  }, [searchTerm, selectedBranch, selectedYear, startDate, endDate])

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated')
    navigate('/enquiryform/login')
  }

  // Extract unique branches and years for filters
  const branches = useMemo(() => ['All', ...new Set(data.map(d => d.branch))], [data])
  const years = useMemo(() => ['All', ...new Set(data.map(d => new Date(d.timestamp).getFullYear().toString()))], [data])

  // Advanced Filtering Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.queries.toLowerCase().includes(searchTerm.toLowerCase())
      
      const itemDate = new Date(item.timestamp)
      const matchesStartDate = !startDate || itemDate >= new Date(startDate)
      const matchesEndDate = !endDate || itemDate <= new Date(endDate + 'T23:59:59')
      
      const matchesBranch = selectedBranch === 'All' || item.branch === selectedBranch
      const matchesYear = selectedYear === 'All' || new Date(item.timestamp).getFullYear().toString() === selectedYear

      return matchesSearch && matchesStartDate && matchesEndDate && matchesBranch && matchesYear
    })
  }, [data, searchTerm, startDate, endDate, selectedBranch, selectedYear])

  const exportToXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      ID: item.id,
      Date: new Date(item.timestamp).toLocaleDateString(),
      Name: item.name,
      Email: item.email,
      Phone: item.phone,
      Course: item.course,
      Branch: item.branch,
      Queries: item.queries
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries")
    XLSX.writeFile(wb, `Enquiries_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Add Title
    doc.setFontSize(18)
    doc.text('Admission Enquiries Report', 14, 22)
    
    // Add Date
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    // Define Table Columns and Rows
    const tableColumn = ["Date", "Name", "Phone", "Email", "Course", "Branch", "Queries"]
    const tableRows = filteredData.map(item => [
      new Date(item.timestamp).toLocaleDateString(),
      item.name,
      item.phone,
      item.email,
      item.course,
      item.branch,
      item.queries
    ])

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [2, 37, 75] } // Matching the theme color #02254b
    })

    // Save PDF
    doc.save(`Enquiries_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="admin-portal">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <FileText className="brand-icon" size={24} />
          <span>ACE ADMIN</span>
        </div>
        <nav className="admin-nav-menu">
          <div className="nav-item active">
            <Users size={18} />
            <span>Enquiries</span>
          </div>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Admission Enquiries Dashboard</h1>
          <div className="admin-stats">
            <div className="stat-card">
              <Users size={24} />
              <div className="stat-content">
                <span className="stat-value">{data.length}</span>
                <span className="stat-label">Total Submissions</span>
              </div>
            </div>
            <div className="stat-card">
              <Calendar size={24} />
              <div className="stat-content">
                <span className="stat-value">{filteredData.length}</span>
                <span className="stat-label">Filtered Results</span>
              </div>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="admin-filters-container">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search name, phone, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="date-filter">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span>to</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y === 'All' ? 'Select Year' : y}</option>)}
            </select>

            <button className="export-btn" onClick={exportToXLSX}>
              <Download size={18} />
              <span>Export XLSX</span>
            </button>

            <button className="export-btn" onClick={exportToPDF} style={{ backgroundColor: '#e74c3c' }}>
              <FileDown size={18} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>{new Date(item.timestamp).toLocaleDateString()}</td>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{item.name}</span>
                      <span className="user-email">{item.email}</span>
                    </div>
                  </td>
                  <td>{item.phone}</td>
                  <td>{item.course}</td>
                  <td>{item.branch}</td>
                  <td>
                    <button className="view-details" onClick={() => setSelectedEnquiry(item)}>View Query</button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    No enquiries found matches your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Query Modal */}
      {selectedEnquiry && (
        <div className="modal-overlay" onClick={() => setSelectedEnquiry(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enquiry Details</h3>
              <button className="close-modal" onClick={() => setSelectedEnquiry(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Visitor Name:</span>
                <span className="detail-value">{selectedEnquiry.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email Address:</span>
                <span className="detail-value">{selectedEnquiry.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone Number:</span>
                <span className="detail-value">{selectedEnquiry.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Course & Branch:</span>
                <span className="detail-value">{selectedEnquiry.course} - {selectedEnquiry.branch}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Submission Date:</span>
                <span className="detail-value">{new Date(selectedEnquiry.timestamp).toLocaleString()}</span>
              </div>
              <div className="query-text-container">
                <p className="detail-label">Visitor Query:</p>
                <div className="query-text-box">
                  {selectedEnquiry.queries || "No queries provided."}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={() => setSelectedEnquiry(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
