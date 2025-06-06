import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { inventoryData } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Download, FilterIcon, Map, Package, Plus, Search, TrendingDown, TrendingUp, AlertTriangle, Clock, Truck, Warehouse, Calendar, Users, CheckCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import { InteractiveChart } from "@/components/interactive-chart";
import { ExpandableDataTable } from "@/components/expandable-data-table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { GanttChart } from "@/components/project-management/gantt-chart";
import { MaterialForecast } from "@/components/project-management/material-forecast";
import { IssueReporting } from "@/components/project-management/issue-reporting";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Enhanced inventory data
const inventoryTrends = [
  { month: 'Jan', consumption: 850, procurement: 900, stockLevel: 2400, forecast: 880 },
  { month: 'Feb', consumption: 920, procurement: 950, stockLevel: 2430, forecast: 940 },
  { month: 'Mar', consumption: 780, procurement: 800, stockLevel: 2450, forecast: 800 },
  { month: 'Apr', consumption: 1100, procurement: 1150, stockLevel: 2500, forecast: 1080 },
  { month: 'May', consumption: 950, procurement: 1000, stockLevel: 2550, forecast: 980 },
  { month: 'Jun', consumption: 1050, procurement: 1100, stockLevel: 2600, forecast: 1020 }
];

const warehouseUtilization = [
  { location: 'Warehouse A', capacity: 100, used: 85, efficiency: 92 },
  { location: 'Warehouse B', capacity: 100, used: 72, efficiency: 88 },
  { location: 'Site Storage 1', capacity: 100, used: 94, efficiency: 85 },
  { location: 'Site Storage 2', capacity: 100, used: 68, efficiency: 90 }
];

const grnData = [
  { id: 'GRN001', supplier: 'Steel Corp', items: 15, value: 450000, status: 'Verified', date: '2024-01-15', variance: 0 },
  { id: 'GRN002', supplier: 'Cement Ltd', items: 8, value: 320000, status: 'Pending', date: '2024-01-16', variance: 2 },
  { id: 'GRN003', supplier: 'Tools Inc', items: 25, value: 180000, status: 'Discrepancy', date: '2024-01-17', variance: 5 },
  { id: 'GRN004', supplier: 'Hardware Co', items: 12, value: 95000, status: 'Verified', date: '2024-01-18', variance: 0 }
];

const transferData = [
  { id: 'TRF001', from: 'Warehouse A', to: 'Site 1', items: 10, status: 'In Transit', driver: 'John Doe', eta: '2 hours' },
  { id: 'TRF002', from: 'Warehouse B', to: 'Site 2', items: 15, status: 'Delivered', driver: 'Jane Smith', eta: 'Completed' },
  { id: 'TRF003', from: 'Site 1', to: 'Warehouse A', items: 5, status: 'Pending', driver: 'Mike Johnson', eta: '4 hours' }
];

// Enhanced mock data for project management features
const mockTasks = [
  {
    id: 'T001',
    name: 'Foundation Excavation',
    startDate: '2024-01-15',
    endDate: '2024-01-25',
    duration: 10,
    progress: 85,
    dependencies: [],
    assignedTo: 'Site Team A',
    priority: 'high' as const,
    status: 'in-progress' as const
  },
  {
    id: 'T002',
    name: 'Concrete Pouring - Foundation',
    startDate: '2024-01-26',
    endDate: '2024-02-05',
    duration: 10,
    progress: 0,
    dependencies: ['T001'],
    assignedTo: 'Concrete Team',
    priority: 'critical' as const,
    status: 'not-started' as const
  },
  {
    id: 'T003',
    name: 'Steel Framework Installation',
    startDate: '2024-02-06',
    endDate: '2024-02-20',
    duration: 14,
    progress: 0,
    dependencies: ['T002'],
    assignedTo: 'Steel Team',
    priority: 'high' as const,
    status: 'not-started' as const
  }
];

// Add the form schema
const addItemFormSchema = z.object({
  name: z.string().min(2, "Item name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  unit: z.string().min(1, "Please select a unit"),
  location: z.string().min(1, "Please select a location"),
  reorderLevel: z.number().min(0, "Reorder level must be 0 or greater"),
  maxStock: z.number().min(0, "Maximum stock must be 0 or greater"),
  safetyStock: z.number().min(0, "Safety stock must be 0 or greater"),
  primarySupplier: z.string().min(2, "Primary supplier name must be at least 2 characters"),
  unitCost: z.number().min(0, "Unit cost must be 0 or greater"),
});

type AddItemFormValues = z.infer<typeof addItemFormSchema>;

const defaultValues: Partial<AddItemFormValues> = {
  quantity: 0,
  reorderLevel: 50,
  maxStock: 500,
  safetyStock: 20,
  unitCost: 0,
};

// Update the interface for filters
interface FilterOption {
  key: string;
  label: string;
  options: string[];
  multiple?: boolean;
}

// Add interfaces for inventory item and transfer
interface InventoryItem {
  id: string;
  name: string;
  category: string[];
  quantity: number;
  unit: string;
  location: string;
  lastUpdated: string;
  reorderLevel?: number;
  maxStock?: number;
  safetyStock?: number;
  isFlagged: boolean;
  primarySupplier?: string;
  unitCost?: number;
  description?: string;
  lastOrderDate?: string;
  nextOrderDate?: string;
  qualityScore?: number;
  photos?: string[];
  notes?: string;
}

interface Transfer {
  id: string;
  from: string;
  to: string;
  items: number;
  status: string;
  driver: string;
  eta: string;
  isFlagged: boolean;
}

// Update category options constant without default option
const CATEGORY_OPTIONS = [
  'Construction Materials',
  'Tools & Equipment',
  'Safety Equipment',
  'Electrical Components',
  'Plumbing Materials',
  'HVAC Equipment',
  'Finishing Materials',
  'Hardware & Fasteners'
];

// Column definitions
const inventoryColumns = [
  { key: 'name', label: 'Item Name', type: 'text' as const },
  { key: 'category', label: 'Category', type: 'badge' as const },
  {
    key: 'quantity', label: 'Quantity',
    render: (value: number) => (
      <Badge variant={value > 100 ? "default" : "destructive"}>
        {value}
      </Badge>
    )
  },
  { key: 'unit', label: 'Unit', type: 'text' as const },
  { key: 'location', label: 'Location', type: 'text' as const },
  { key: 'lastUpdated', label: 'Last Updated', type: 'text' as const },
  { key: 'actions', label: 'Actions', type: 'actions' as const }
];

const transferColumns = [
  { key: 'id', label: 'Transfer ID', type: 'text' as const },
  { key: 'from', label: 'From', type: 'text' as const },
  { key: 'to', label: 'To', type: 'text' as const },
  { key: 'items', label: 'Items', type: 'text' as const },
  { key: 'status', label: 'Status', type: 'badge' as const },
  { key: 'driver', label: 'Driver', type: 'text' as const },
  { key: 'eta', label: 'ETA', type: 'text' as const },
  { key: 'actions', label: 'Actions', type: 'actions' as const }
];

const inventoryExpandableContent = (row: InventoryItem) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <h4 className="font-medium mb-2">Stock Details</h4>
      <div className="space-y-1 text-sm">
        <div>Reorder Level: {row.reorderLevel || 50}</div>
        <div>Max Stock: {row.maxStock || 500}</div>
        <div>Safety Stock: {row.safetyStock || 20}</div>
        <div>Lead Time: 5 days</div>
      </div>
    </div>
    <div>
      <h4 className="font-medium mb-2">Usage History</h4>
      <div className="space-y-1 text-sm">
        <div>Last Month: 45 {row.unit}</div>
        <div>Average Monthly: 52 {row.unit}</div>
        <div>Peak Usage: 89 {row.unit}</div>
      </div>
    </div>
    <div>
      <h4 className="font-medium mb-2">Supplier Info</h4>
      <div className="space-y-1 text-sm">
        <div>Primary: ABC Suppliers</div>
        <div>Secondary: XYZ Corp</div>
        <div>Last Order: 2024-01-10</div>
        <div>Unit Cost: ₹150</div>
      </div>
    </div>
  </div>
);

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(
    inventoryData.map(item => ({
      ...item,
      id: item.id || Math.random().toString(36).substr(2, 9),
      reorderLevel: 50,
      maxStock: 500,
      safetyStock: 20,
      isFlagged: false,
      // Convert single category to array
      category: item.category ? [item.category] : []
    }))
  );
  const [transfers, setTransfers] = useState<Transfer[]>(
    transferData.map(transfer => ({
      ...transfer,
      isFlagged: false
    }))
  );

  // Add new state variables for quick action dialogs
  const [isResolveIssuesOpen, setIsResolveIssuesOpen] = useState(false);
  const [isTrackMaterialsOpen, setIsTrackMaterialsOpen] = useState(false);
  const [isViewScheduleOpen, setIsViewScheduleOpen] = useState(false);
  const [isReviewProgressOpen, setIsReviewProgressOpen] = useState(false);

  // Add action handlers
  const handleInventoryAction = (action: string, item: InventoryItem, updatedData?: any) => {
    switch (action) {
      case 'view':
        handleViewDetails(item);
        break;
      case 'edit':
        const updatedItems = inventoryItems.map(i => 
          i.id === item.id ? { ...i, ...updatedData } : i
        );
        setInventoryItems(updatedItems);
        toast.success('Inventory item updated successfully');
        break;
      
      case 'flag':
        const flaggedItems = inventoryItems.map(i => 
          i.id === item.id ? { ...i, isFlagged: !i.isFlagged } : i
        );
        setInventoryItems(flaggedItems);
        toast.success(`Item ${item.isFlagged ? 'unflagged' : 'flagged'} successfully`);
        break;
    }
  };

  const handleTransferAction = (action: string, transfer: Transfer, updatedData?: any) => {
    switch (action) {
      case 'edit':
        const updatedTransfers = transfers.map(t => 
          t.id === transfer.id ? { ...t, ...updatedData } : t
        );
        setTransfers(updatedTransfers);
        toast.success('Transfer updated successfully');
        break;
      
      case 'flag':
        const flaggedTransfers = transfers.map(t => 
          t.id === transfer.id ? { ...t, isFlagged: !t.isFlagged } : t
        );
        setTransfers(flaggedTransfers);
        toast.success(`Transfer ${transfer.isFlagged ? 'unflagged' : 'flagged'} successfully`);
        break;
    }
  };

  // Filter items based on search and filters
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !selectedLocation || selectedLocation === 'all_locations' || item.location === selectedLocation;
    const matchesCategory = !selectedCategory || item.category.includes(selectedCategory);
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const form = useForm<AddItemFormValues>({
    resolver: zodResolver(addItemFormSchema),
    defaultValues,
  });

  const onSubmit = (data: AddItemFormValues) => {
    // Here you would typically make an API call to add the item
    console.log("Form submitted:", data);
    toast.success("Item added successfully!");
    setIsAddItemOpen(false);
    form.reset();
  };

  const handleExport = (tabName: string) => {
    let exportData: any[] = [];
    let fileName = '';

    switch (tabName) {
      case 'project-overview':
        exportData = mockTasks.map(task => ({
          'Task ID': task.id,
          'Task Name': task.name,
          'Start Date': task.startDate,
          'End Date': task.endDate,
          'Progress': `${task.progress}%`,
          'Status': task.status,
          'Priority': task.priority,
          'Assigned To': task.assignedTo
        }));
        fileName = 'project-tasks';
        break;

      case 'inventory':
        exportData = filteredItems.map(item => ({
          'Item Name': item.name,
          'Category': item.category.join(', '),
          'Quantity': item.quantity,
          'Unit': item.unit,
          'Location': item.location,
          'Last Updated': item.lastUpdated,
          'Reorder Level': item.reorderLevel,
          'Max Stock': item.maxStock,
          'Safety Stock': item.safetyStock
        }));
        fileName = 'inventory-items';
        break;

      case 'transfers':
        exportData = transfers.map(transfer => ({
          'Transfer ID': transfer.id,
          'From': transfer.from,
          'To': transfer.to,
          'Items': transfer.items,
          'Status': transfer.status,
          'Driver': transfer.driver,
          'ETA': transfer.eta
        }));
        fileName = 'material-transfers';
        break;

      case 'warehouse':
        exportData = warehouseUtilization.map(warehouse => ({
          'Location': warehouse.location,
          'Capacity': `${warehouse.capacity}%`,
          'Used Space': `${warehouse.used}%`,
          'Available Space': `${warehouse.capacity - warehouse.used}%`,
          'Efficiency': `${warehouse.efficiency}%`
        }));
        fileName = 'warehouse-utilization';
        break;

      case 'analytics':
        // Create workbook with multiple sheets
        const wb = XLSX.utils.book_new();
        
        // Progress data
        const progressData = [
          { month: 'Jan', planned: 25, actual: 23, efficiency: 92 },
          { month: 'Feb', planned: 30, actual: 28, efficiency: 93 },
          { month: 'Mar', planned: 35, actual: 32, efficiency: 91 },
          { month: 'Apr', planned: 40, actual: 39, efficiency: 97 },
          { month: 'May', planned: 45, actual: 44, efficiency: 98 },
          { month: 'Jun', planned: 50, actual: 48, efficiency: 96 }
        ].map(data => ({
          'Month': data.month,
          'Planned Progress': `${data.planned}%`,
          'Actual Progress': `${data.actual}%`,
          'Efficiency': `${data.efficiency}%`
        }));

        // Cost data
        const costData = [
          { category: 'Raw Materials', cost: 850000, budget: 900000 },
          { category: 'Equipment', cost: 320000, budget: 350000 },
          { category: 'Labor', cost: 450000, budget: 400000 },
          { category: 'Transport', cost: 180000, budget: 200000 }
        ].map(data => ({
          'Category': data.category,
          'Actual Cost': `₹${data.cost}`,
          'Budget': `₹${data.budget}`,
          'Variance': `₹${data.budget - data.cost}`
        }));

        const ws1 = XLSX.utils.json_to_sheet(progressData);
        const ws2 = XLSX.utils.json_to_sheet(costData);
        
        XLSX.utils.book_append_sheet(wb, ws1, 'Progress Analytics');
        XLSX.utils.book_append_sheet(wb, ws2, 'Cost Analytics');
        
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        
        toast.success("Analytics data has been exported to Excel");
        return;

      default:
        toast.error("No data available for export");
        return;
    }

    if (exportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file with current date in filename
    const currentDate = new Date().toISOString().split('T')[0];
    saveAs(data, `${fileName}-${currentDate}.xlsx`);

    toast.success("Data has been exported to Excel");
  };

  // Add handlers for quick actions
  const handleResolveIssues = () => {
    const criticalIssues = [
      { id: 'ISS001', title: 'Material shortage', priority: 'high', status: 'open' },
      { id: 'ISS002', title: 'Equipment malfunction', priority: 'critical', status: 'open' },
      { id: 'ISS003', title: 'Quality control failure', priority: 'high', status: 'open' }
    ];
    setIsResolveIssuesOpen(true);
    toast.info(`${criticalIssues.length} critical issues found`, {
      description: "Prioritizing resolution based on impact severity"
    });
  };

  const handleTrackMaterials = () => {
    const delayedMaterials = [
      { id: 'MAT001', name: 'Steel Bars', delay: '2 days', supplier: 'Steel Corp' },
      { id: 'MAT002', name: 'Cement Bags', delay: '1 day', supplier: 'Cement Ltd' },
      { id: 'MAT003', name: 'Electrical Cables', delay: '3 days', supplier: 'Electric Co' }
    ];
    setIsTrackMaterialsOpen(true);
    toast.info(`${delayedMaterials.length} materials delayed`, {
      description: "Tracking delivery status and coordinating with suppliers"
    });
  };

  const handleViewSchedule = () => {
    const scheduledWorkers = [
      { id: 'W001', name: 'John Doe', role: 'Mason', shift: 'Morning' },
      { id: 'W002', name: 'Jane Smith', role: 'Electrician', shift: 'Morning' },
      { id: 'W003', name: 'Mike Johnson', role: 'Plumber', shift: 'Afternoon' }
    ];
    setIsViewScheduleOpen(true);
    toast.info(`${scheduledWorkers.length} workers scheduled`, {
      description: "Reviewing workforce allocation and shifts"
    });
  };

  const handleReviewProgress = () => {
    const milestones = [
      { id: 'M001', name: 'Foundation Work', progress: 100, dueDate: '2024-01-25' },
      { id: 'M002', name: 'Steel Framework', progress: 75, dueDate: '2024-01-30' }
    ];
    setIsReviewProgressOpen(true);
    toast.info(`${milestones.length} milestones due this week`, {
      description: "Analyzing project timeline and deliverables"
    });
  };

  // Add view details handler
  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsViewDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project & Inventory Management</h1>
          <p className="text-muted-foreground">Comprehensive project tracking, inventory management and material planning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('inventory')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddItemOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new item to the inventory.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange([value]);
                        }}
                        value={field.value?.[0] || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category">
                              {field.value?.[0] || "Select a category..."}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter quantity"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="meters">Meters</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="bags">Bags</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                          <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                          <SelectItem value="Site 1">Site 1</SelectItem>
                          <SelectItem value="Site 2">Site 2</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter reorder level"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter maximum stock"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="safetyStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter safety stock"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primarySupplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supplier name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter unit cost"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddItemOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="project-overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="project-overview">Project Overview</TabsTrigger>
          <TabsTrigger value="material-forecast">Material Forecast</TabsTrigger>
          <TabsTrigger value="issue-tracking">Issue Tracking</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="project-overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <EnhancedStatCard
              title="Active Projects"
              value="12"
              icon={Package}
              trend={{ value: 3, label: "new projects this month" }}
              threshold={{ status: 'good', message: 'Project pipeline healthy' }}
            />
            <EnhancedStatCard
              title="Critical Issues"
              value="3"
              icon={AlertTriangle}
              trend={{ value: -2, label: "fewer than last week" }}
              threshold={{ status: 'warning', message: 'Monitor critical issues closely' }}
            />
            <EnhancedStatCard
              title="Material Requests"
              value="18"
              icon={TrendingUp}
              trend={{ value: 15, label: "increase this week" }}
              threshold={{ status: 'good', message: 'Procurement pipeline active' }}
            />
            <EnhancedStatCard
              title="On-Time Completion"
              value="87%"
              description="Project milestone completion rate"
              icon={CheckCircle}
              trend={{ value: 5, label: "improvement" }}
              threshold={{ status: 'good', message: 'Excellent project delivery' }}
            />
          </div>

          {/* Enhanced Gantt Chart */}
          <GanttChart
            projectId="PROJ001"
            tasks={mockTasks}
            onTaskUpdate={(taskId, updates) => {
              console.log('Task updated:', taskId, updates);
            }}
          />

          {/* Quick Actions Dashboard with updated buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions & Project Health</CardTitle>
              <CardDescription>Real-time project monitoring and immediate actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-900">Critical Issues</span>
                  </div>
                  <p className="text-sm text-red-700">3 issues requiring immediate attention</p>
                  <Button size="sm" variant="destructive" className="mt-2" onClick={handleResolveIssues}>
                    Resolve Issues
                  </Button>
                </div>

                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Material Delays</span>
                  </div>
                  <p className="text-sm text-yellow-700">5 materials behind schedule</p>
                  <Button size="sm" variant="secondary" className="mt-2" onClick={handleTrackMaterials}>
                    Track Materials
                  </Button>
                </div>

                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Labor Planning</span>
                  </div>
                  <p className="text-sm text-blue-700">15 workers scheduled for tomorrow</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={handleViewSchedule}>
                    View Schedule
                  </Button>
                </div>

                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Milestones</span>
                  </div>
                  <p className="text-sm text-green-700">2 milestones due this week</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={handleReviewProgress}>
                    Review Progress
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => handleExport('project-overview')}>
              <Download className="mr-2 h-4 w-4" />
              Export Project Data
            </Button>
          </div> */}
        </TabsContent>

        <TabsContent value="material-forecast" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Forecast Accuracy"
              value="94.2%"
              icon={TrendingUp}
              description="Material prediction accuracy"
              trend={{ value: 3, label: "improvement this month" }}
              threshold={{ status: 'good', message: 'Excellent forecasting performance' }}
            />
            <EnhancedStatCard
              title="Upcoming Requirements"
              value="₹24.5L"
              icon={Package}
              description="Next 2 weeks material cost"
              trend={{ value: 12, label: "increase from last period" }}
            />
            <EnhancedStatCard
              title="Lead Time Variance"
              value="±2.1 days"
              icon={Clock}
              description="Average delivery variance"
              threshold={{ status: 'warning', message: 'Monitor supplier performance' }}
            />
            <EnhancedStatCard
              title="Stock Optimization"
              value="87%"
              icon={Package}
              description="Inventory efficiency score"
              trend={{ value: 5, label: "improvement" }}
            />
          </div>

          <MaterialForecast
            projectId="PROJ001"
            timeframe="1-month"
          />
        </TabsContent>

        <TabsContent value="issue-tracking" className="space-y-6">
          <IssueReporting
            projectId="PROJ001"
            siteId="SITE001"
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Stock Accuracy"
              value="96.5%"
              icon={Package}
              description="Physical vs system count"
              trend={{ value: 2, label: "improvement" }}
              threshold={{ status: 'good', message: 'Excellent stock accuracy' }}
            />
            <EnhancedStatCard
              title="Dead Stock"
              value="₹2.8L"
              icon={AlertTriangle}
              description="Non-moving inventory"
              threshold={{ status: 'warning', message: 'Review and liquidate dead stock' }}
            />
            <EnhancedStatCard
              title="ABC Analysis"
              value="A: 20% | B: 30% | C: 50%"
              icon={TrendingUp}
              description="Value-based classification"
            />
            <EnhancedStatCard
              title="Cycle Count Due"
              value="15"
              icon={Clock}
              description="Items for verification"
              threshold={{ status: 'warning', message: 'Schedule cycle counts' }}
            />
          </div>

          <ExpandableDataTable
            title="Inventory Items"
            description="Comprehensive inventory management with detailed insights"
            data={filteredItems}
            columns={[
              { key: 'name', label: 'Item Name', type: 'text' as const },
              { 
                key: 'category', 
                label: 'Category', 
                type: 'badge' as const,
                options: CATEGORY_OPTIONS,
                multiple: false,
                render: (value: string[], item: InventoryItem) => (
                  <div className="flex flex-wrap gap-1">
                    {value?.[0] ? (
                      <Badge variant="secondary" className="mr-1">
                        {value[0]}
                      </Badge>
                    ) : null}
                  </div>
                )
              },
              {
                key: 'quantity', label: 'Quantity',
                render: (value: number, item: InventoryItem) => (
                  <Badge variant={value > (item.reorderLevel || 50) ? "default" : "destructive"}>
                    {value} {item.unit}
                  </Badge>
                )
              },
              { key: 'location', label: 'Location', type: 'text' as const },
              { key: 'lastUpdated', label: 'Last Updated', type: 'text' as const },
              {
                key: 'status',
                label: 'Status',
                render: (_, item: InventoryItem) => (
                  <Badge variant={item.quantity > (item.reorderLevel || 50) ? "default" : "destructive"}>
                    {item.quantity > (item.reorderLevel || 50) ? "In Stock" : "Low Stock"}
                  </Badge>
                )
              },
              { key: 'actions', label: 'Actions', type: 'actions' as const }
            ]}
            expandableContent={inventoryExpandableContent}
            searchKey="name"
            filters={[
              { 
                key: 'category', 
                label: 'Category', 
                options: CATEGORY_OPTIONS,
                multiple: false
              },
              { 
                key: 'location', 
                label: 'Location', 
                options: ['Warehouse A', 'Warehouse B', 'Site 1'] 
              }
            ]}
            onRowAction={handleInventoryAction}
          />

          {/* View Details Dialog */}
          <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedItem && (
                <>
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <DialogTitle className="text-2xl">{selectedItem.name}</DialogTitle>
                        <DialogDescription>
                          Item ID: {selectedItem.id} • Last Updated: {selectedItem.lastUpdated}
                        </DialogDescription>
                      </div>
                      <Badge variant={selectedItem.quantity > (selectedItem.reorderLevel || 50) ? "default" : "destructive"}>
                        {selectedItem.quantity > (selectedItem.reorderLevel || 50) ? "In Stock" : "Low Stock"}
                      </Badge>
                    </div>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Stock Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Stock Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Current Quantity</Label>
                            <p className="text-2xl font-bold">{selectedItem.quantity} {selectedItem.unit}</p>
                          </div>
                          <div>
                            <Label>Category</Label>
                            <p className="text-lg">{selectedItem.category.join(', ')}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Reorder Level</span>
                            <span>{selectedItem.reorderLevel || 50} {selectedItem.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maximum Stock</span>
                            <span>{selectedItem.maxStock || 500} {selectedItem.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Safety Stock</span>
                            <span>{selectedItem.safetyStock || 20} {selectedItem.unit}</span>
                          </div>
                        </div>
                        <Progress 
                          value={(selectedItem.quantity / (selectedItem.maxStock || 500)) * 100} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>

                    {/* Location & Movement */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Location & Movement</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Current Location</Label>
                          <p className="text-lg">{selectedItem.location}</p>
                        </div>
                        <div>
                          <Label>Last Order Date</Label>
                          <p>{selectedItem.lastOrderDate || 'N/A'}</p>
                        </div>
                        <div>
                          <Label>Next Scheduled Order</Label>
                          <p>{selectedItem.nextOrderDate || 'Not scheduled'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Supplier Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Supplier Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Primary Supplier</Label>
                          <p className="text-lg">{selectedItem.primarySupplier || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label>Unit Cost</Label>
                          <p className="text-lg">₹{selectedItem.unitCost || 0}</p>
                        </div>
                        <div>
                          <Label>Quality Score</Label>
                          <div className="flex items-center gap-2">
                            <Progress value={selectedItem.qualityScore || 85} className="h-2" />
                            <span>{selectedItem.qualityScore || 85}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes & Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Description</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedItem.description || 'No description available'}
                          </p>
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedItem.notes || 'No notes available'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setIsViewDetailsOpen(false);
                      toast.success('Item details updated successfully');
                    }}>
                      Update
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Active Transfers"
              value="7"
              icon={Truck}
              description="Currently in transit"
              threshold={{ status: 'good', message: 'Normal transfer activity' }}
            />
            <EnhancedStatCard
              title="Today's Transfers"
              value="15"
              icon={Package}
              description="Completed today"
              trend={{ value: 25, label: "vs yesterday" }}
            />
            <EnhancedStatCard
              title="Avg Transit Time"
              value="3.2 hrs"
              icon={Clock}
              description="Site to site transfers"
              trend={{ value: -10, label: "improvement" }}
            />
            <EnhancedStatCard
              title="Transfer Accuracy"
              value="98.5%"
              icon={TrendingUp}
              description="Items delivered correctly"
              threshold={{ status: 'good', message: 'Excellent transfer accuracy' }}
            />
          </div>

          <ExpandableDataTable
            title="Material Transfers"
            description="Track material movement between locations"
            data={transfers}
            columns={transferColumns}
            expandableContent={(row) => (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Transfer Details</h4>
                  <div className="text-sm space-y-1">
                    <div>Request Date: {row.requestDate || '2024-01-15'}</div>
                    <div>Approved By: {row.approvedBy || 'Site Manager'}</div>
                    <div>Vehicle: {row.vehicle || 'TRK-001'}</div>
                    <div>Priority: {row.priority || 'Normal'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Items List</h4>
                  <div className="text-sm space-y-1">
                    <div>• Cement bags: 50 units</div>
                    <div>• Steel rods: 25 units</div>
                    <div>• Safety helmets: 10 units</div>
                  </div>
                </div>
              </div>
            )}
            searchKey="id"
            filters={[
              { key: 'status', label: 'Status', options: ['Pending', 'In Transit', 'Delivered'] }
            ]}
            onRowAction={handleTransferAction}
          />
          {/* <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => handleExport('transfers')}>
              <Download className="mr-2 h-4 w-4" />
              Export Transfers
            </Button>
          </div> */}
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <EnhancedStatCard
              title="Storage Utilization"
              value="82%"
              icon={Warehouse}
              description="Average across locations"
              trend={{ value: 5, label: "increase" }}
              threshold={{ status: 'good', message: 'Optimal storage utilization' }}
            />
            <EnhancedStatCard
              title="Available Space"
              value="2,450 sqft"
              icon={Map}
              description="Across all warehouses"
              threshold={{ status: 'good', message: 'Adequate space available' }}
            />
            <EnhancedStatCard
              title="Equipment Status"
              value="94%"
              icon={TrendingUp}
              description="Operational equipment"
              trend={{ value: 2, label: "improvement" }}
            />
            <EnhancedStatCard
              title="Security Score"
              value="9.2/10"
              icon={AlertTriangle}
              description="Security assessment"
              threshold={{ status: 'good', message: 'Excellent security measures' }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Space Utilization</CardTitle>
                <CardDescription>Real-time space usage across locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warehouseUtilization.map((warehouse) => (
                    <div key={warehouse.location} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{warehouse.location}</span>
                        <span>{warehouse.used}% utilized</span>
                      </div>
                      <Progress value={warehouse.used} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Efficiency: {warehouse.efficiency}%</span>
                        <span>{warehouse.capacity - warehouse.used}% available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipment & Maintenance</CardTitle>
                <CardDescription>Warehouse equipment status and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { equipment: 'Forklift A', status: 'Operational', nextMaintenance: '5 days', efficiency: 95 },
                    { equipment: 'Conveyor Belt', status: 'Maintenance Due', nextMaintenance: 'Overdue', efficiency: 80 },
                    { equipment: 'Loading Dock 1', status: 'Operational', nextMaintenance: '12 days', efficiency: 98 },
                    { equipment: 'Crane System', status: 'Operational', nextMaintenance: '8 days', efficiency: 92 }
                  ].map((item) => (
                    <div key={item.equipment} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.equipment}</h4>
                        <p className="text-sm text-muted-foreground">
                          Next maintenance: {item.nextMaintenance}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.status === 'Operational' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.efficiency}% efficiency
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => handleExport('warehouse')}>
              <Download className="mr-2 h-4 w-4" />
              Export Warehouse Data
            </Button>
          </div> */}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InteractiveChart
              title="Project Progress Analytics"
              description="Real-time project completion trends"
              data={[
                { month: 'Jan', planned: 25, actual: 23, efficiency: 92 },
                { month: 'Feb', planned: 30, actual: 28, efficiency: 93 },
                { month: 'Mar', planned: 35, actual: 32, efficiency: 91 },
                { month: 'Apr', planned: 40, actual: 39, efficiency: 97 },
                { month: 'May', planned: 45, actual: 44, efficiency: 98 },
                { month: 'Jun', planned: 50, actual: 48, efficiency: 96 }
              ]}
              type="line"
              dataKey="actual"
              secondaryDataKey="planned"
              xAxisKey="month"
              showComparison={true}
            />

            <InteractiveChart
              title="Material Cost Trends"
              description="Monthly material expenditure analysis"
              data={[
                { category: 'Raw Materials', cost: 850000, budget: 900000 },
                { category: 'Equipment', cost: 320000, budget: 350000 },
                { category: 'Labor', cost: 450000, budget: 400000 },
                { category: 'Transport', cost: 180000, budget: 200000 }
              ]}
              type="bar"
              dataKey="cost"
              secondaryDataKey="budget"
              xAxisKey="category"
            />
          </div>
          {/* <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => handleExport('analytics')}>
              <Download className="mr-2 h-4 w-4" />
              Export Analytics
            </Button>
          </div> */}
        </TabsContent>
      </Tabs>

      {/* Resolve Issues Dialog */}
      <Dialog open={isResolveIssuesOpen} onOpenChange={setIsResolveIssuesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Critical Issues Resolution</DialogTitle>
            <DialogDescription>
              Review and take action on critical issues requiring immediate attention
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { id: 'ISS001', title: 'Material shortage', priority: 'high', status: 'open', description: 'Urgent steel reinforcement shortage affecting foundation work' },
              { id: 'ISS002', title: 'Equipment malfunction', priority: 'critical', status: 'open', description: 'Main crane hydraulic system failure' },
              { id: 'ISS003', title: 'Quality control failure', priority: 'high', status: 'open', description: 'Concrete mixture not meeting strength requirements' }
            ].map((issue) => (
              <div key={issue.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{issue.title}</h4>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                  <Badge variant={issue.priority === 'critical' ? 'destructive' : 'default'}>
                    {issue.priority}
                  </Badge>
                </div>
                <Button size="sm" onClick={() => {
                  toast.success(`Issue ${issue.id} marked for resolution`);
                }}>
                  Start Resolution
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveIssuesOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Track Materials Dialog */}
      <Dialog open={isTrackMaterialsOpen} onOpenChange={setIsTrackMaterialsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Material Tracking</DialogTitle>
            <DialogDescription>
              Monitor delayed materials and their current status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { id: 'MAT001', name: 'Steel Bars', delay: '2 days', supplier: 'Steel Corp', status: 'In Transit' },
              { id: 'MAT002', name: 'Cement Bags', delay: '1 day', supplier: 'Cement Ltd', status: 'Processing' },
              { id: 'MAT003', name: 'Electrical Cables', delay: '3 days', supplier: 'Electric Co', status: 'Delayed' }
            ].map((material) => (
              <div key={material.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{material.name}</h4>
                    <p className="text-sm text-muted-foreground">Supplier: {material.supplier}</p>
                  </div>
                  <Badge variant={material.status === 'Delayed' ? 'destructive' : 'default'}>
                    {material.status}
                  </Badge>
                </div>
                <p className="text-sm text-red-600 mb-2">Delayed by: {material.delay}</p>
                <Button size="sm" onClick={() => {
                  toast.success(`Expedited delivery request sent for ${material.name}`);
                }}>
                  Expedite Delivery
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrackMaterialsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Schedule Dialog */}
      <Dialog open={isViewScheduleOpen} onOpenChange={setIsViewScheduleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Labor Schedule</DialogTitle>
            <DialogDescription>
              Review workforce allocation and shift schedules
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { id: 'W001', name: 'John Doe', role: 'Mason', shift: 'Morning', location: 'Block A' },
              { id: 'W002', name: 'Jane Smith', role: 'Electrician', shift: 'Morning', location: 'Block B' },
              { id: 'W003', name: 'Mike Johnson', role: 'Plumber', shift: 'Afternoon', location: 'Block A' }
            ].map((worker) => (
              <div key={worker.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{worker.name}</h4>
                    <p className="text-sm text-muted-foreground">{worker.role}</p>
                  </div>
                  <Badge>{worker.shift}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Location: {worker.location}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewScheduleOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Progress Dialog */}
      <Dialog open={isReviewProgressOpen} onOpenChange={setIsReviewProgressOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Milestone Progress Review</DialogTitle>
            <DialogDescription>
              Track project milestones and their completion status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { id: 'M001', name: 'Foundation Work', progress: 100, dueDate: '2024-01-25', status: 'Completed' },
              { id: 'M002', name: 'Steel Framework', progress: 75, dueDate: '2024-01-30', status: 'In Progress' }
            ].map((milestone) => (
              <div key={milestone.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{milestone.name}</h4>
                    <p className="text-sm text-muted-foreground">Due: {milestone.dueDate}</p>
                  </div>
                  <Badge variant={milestone.status === 'Completed' ? 'default' : 'secondary'}>
                    {milestone.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewProgressOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
