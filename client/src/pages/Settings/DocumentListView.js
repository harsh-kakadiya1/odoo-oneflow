import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  RefreshCw,
  ChevronDown,
  X
} from 'lucide-react';
import { format } from 'date-fns';

const ListFilters = ({ filters, onFilterChange, onClear, projects }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 p-4 shadow-lg z-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project
              </label>
              <select
                value={filters.projectId || ''}
                onChange={(e) => onFilterChange('projectId', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Projects</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => onFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => onFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Amount Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.minAmount || ''}
                  onChange={(e) => onFilterChange('minAmount', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.maxAmount || ''}
                  onChange={(e) => onFilterChange('maxAmount', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={onClear}>
                Clear All
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const ListGroupBy = ({ groupBy, onGroupChange, options }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Group by:</span>
      <select
        value={groupBy}
        onChange={(e) => onGroupChange(e.target.value)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="">None</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const DocumentListView = ({
  title,
  documents,
  loading,
  columns,
  searchPlaceholder,
  createHref,
  onRefresh,
  onSearch,
  searchTerm,
  filters,
  onFilterChange,
  onClearFilters,
  groupBy,
  onGroupChange,
  groupByOptions,
  projects,
  renderRow
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm || '');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(localSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localSearch, onSearch]);

  const groupedDocuments = React.useMemo(() => {
    if (!groupBy || !documents) return { '': documents };

    return documents.reduce((groups, doc) => {
      let groupKey = '';
      switch (groupBy) {
        case 'project':
          groupKey = doc.project?.name || 'No Project';
          break;
        case 'status':
          groupKey = doc.status || 'Unknown';
          break;
        case 'partner':
          groupKey = doc.partner_name || 'Unknown Partner';
          break;
        default:
          groupKey = '';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(doc);
      return groups;
    }, {});
  }, [documents, groupBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">
            {documents?.length || 0} records found
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link to={createHref}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ListGroupBy
              groupBy={groupBy}
              onGroupChange={onGroupChange}
              options={groupByOptions}
            />
            <ListFilters
              filters={filters}
              onFilterChange={onFilterChange}
              onClear={onClearFilters}
              projects={projects}
            />
          </div>
        </div>
      </Card>

      {/* Documents List */}
      <div className="space-y-6">
        {Object.entries(groupedDocuments).map(([groupKey, groupDocs]) => (
          <div key={groupKey}>
            {groupKey && (
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                {groupKey} ({groupDocs.length})
              </h3>
            )}
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {groupDocs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No records found
                        </td>
                      </tr>
                    ) : (
                      groupDocs.map((doc) => renderRow(doc))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentListView;