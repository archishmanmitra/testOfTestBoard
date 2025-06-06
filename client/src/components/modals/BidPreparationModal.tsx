import React, { useState } from 'react';
import { X, Building2, FileText, Plus, Minus, Calculator, Calendar, User2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BidPreparationModalProps {
  onClose: () => void;
}

interface RequirementItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

const BidPreparationModal: React.FC<BidPreparationModalProps> = ({ onClose }) => {
  const [requirements, setRequirements] = useState<RequirementItem[]>([
    { id: 1, description: 'Construction Materials', quantity: 1000, unit: 'tons', estimatedCost: 5000000 },
    { id: 2, description: 'Labor Force', quantity: 100, unit: 'workers', estimatedCost: 3000000 }
  ]);

  const addRequirement = () => {
    const newId = Math.max(...requirements.map(item => item.id)) + 1;
    setRequirements([...requirements, {
      id: newId,
      description: '',
      quantity: 0,
      unit: '',
      estimatedCost: 0
    }]);
  };

  const removeRequirement = (id: number) => {
    setRequirements(requirements.filter(item => item.id !== id));
  };

  const updateRequirement = (id: number, field: keyof RequirementItem, value: string | number) => {
    setRequirements(requirements.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const totalEstimatedCost = requirements.reduce((sum, item) => sum + item.estimatedCost, 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-background rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-muted/40">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create New Tender</h2>
              <p className="text-sm text-muted-foreground">Prepare and submit a new tender proposal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Tender Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-500" />
                    Project Information
                  </CardTitle>
                  <CardDescription>Fill in the basic tender details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tender Number</label>
                      <Input value="TND-2024-001" readOnly className="bg-muted font-mono" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Submission Date</label>
                      <div className="relative">
                        <Input type="date" className="pl-9" />
                        <Calendar className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input placeholder="Enter project name" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Client</label>
                      <div className="relative">
                        <Select>
                          <SelectTrigger className="pl-9">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green-valley">Green Valley Developers</SelectItem>
                            <SelectItem value="metropolitan">Metropolitan Holdings</SelectItem>
                            <SelectItem value="city-center">City Center Corp</SelectItem>
                          </SelectContent>
                        </Select>
                        <User2 className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <div className="relative">
                        <Input placeholder="Project location" className="pl-9" />
                        <MapPin className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Project Requirements</CardTitle>
                      <CardDescription>Add project requirements and estimated costs</CardDescription>
                    </div>
                    <Button onClick={addRequirement} size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Requirement
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-3">
                      <div className="col-span-4">Description</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-3">Estimated Cost</div>
                      <div className="col-span-1"></div>
                    </div>
                    
                    {requirements.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-muted/5 border rounded-lg hover:bg-muted/10 transition-colors">
                        <div className="col-span-4">
                          <Input
                            placeholder="Enter requirement"
                            value={item.description}
                            onChange={(e) => updateRequirement(item.id, 'description', e.target.value)}
                            className="border-muted"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateRequirement(item.id, 'quantity', Number(e.target.value))}
                            className="border-muted"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={item.unit}
                            onChange={(e) => updateRequirement(item.id, 'unit', e.target.value)}
                            className="border-muted"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            value={item.estimatedCost}
                            onChange={(e) => updateRequirement(item.id, 'estimatedCost', Number(e.target.value))}
                            className="border-muted font-mono"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRequirement(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="mt-6 space-y-3 border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Estimated Cost:</span>
                        <span className="font-mono text-purple-600">₹{totalEstimatedCost.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Add more details to your tender</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project Duration (months)</label>
                    <Input type="number" placeholder="24" className="max-w-[200px]" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scope of Work</label>
                    <Textarea 
                      placeholder="Detailed description of work scope..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Special Requirements</label>
                    <Textarea 
                      placeholder="Any special requirements or conditions..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Tender Summary</CardTitle>
                  <CardDescription>Preview tender details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6 bg-white space-y-4 shadow-sm">
                    <div className="text-center space-y-1">
                      <h3 className="font-semibold text-xl">TND-2024-001</h3>
                      <p className="text-sm text-muted-foreground">New Construction Project</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estimated Value:</span>
                        <span className="font-medium">₹{totalEstimatedCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>24 months</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Requirements:</span>
                        <span>{requirements.length} items</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Available actions for this tender</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                    <FileText className="h-4 w-4" />
                    Submit Tender
                  </Button>
                  <Button variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                  <Button variant="outline" className="w-full">
                    Preview Documents
                  </Button>
                  <Button variant="outline" className="w-full">
                    Calculate Estimates
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Submission Checklist</CardTitle>
                  <CardDescription>Required documents and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Technical Proposal:</span>
                      <span className="font-medium text-yellow-600">Pending</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Financial Proposal:</span>
                      <span className="font-medium text-yellow-600">Pending</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Supporting Docs:</span>
                      <span className="font-medium text-yellow-600">Pending</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Overall Status:</span>
                      <span className="font-medium text-yellow-600">In Progress</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Auto-saved 1 minute ago
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                <Plus className="h-4 w-4" />
                Create Tender
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidPreparationModal;