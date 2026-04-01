import { Plus, X, MessageSquare, Phone, FileText, Mail, Send, Clock, Upload, Download, ArrowRightLeft, Store, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dealsApi } from "@/lib/api";
import { format, isToday, isThisWeek, isAfter, isBefore, addWeeks } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useCreateDeal } from "@/hooks/useCrmData";
import { useToast } from "@/components/ui/use-toast";

const activityColumns = [
  { id: "overdue", name: "Overdue", color: "bg-destructive", count: 0 },
  { id: "today", name: "Due today", color: "bg-success", count: 0 },
  { id: "this_week", name: "Due this week", color: "bg-chart-1", count: 0 },
  { id: "next_week", name: "Due next week", color: "bg-chart-1", count: 0 },
  { id: "idle", name: "Idle", color: "bg-muted-foreground", count: 0 },
  { id: "later", name: "Due later", color: "bg-success", count: 0 },
];

export function DealsActivitiesView() {
  const [showInfoCard, setShowInfoCard] = useState(true);
  const [showPresetsCard, setShowPresetsCard] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const createDeal = useCreateDeal();

  // Fetch real deals data
  const { data: dealsResponse, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getAll({ limit: 100 }),
  });

  const deals = dealsResponse?.data || [];

  // Function to create a quick deal
  const handleCreateQuickDeal = () => {
    navigate('/crm/deals/create');
  };

  // Function to create a deal with specific due date based on column
  const handleCreateDealForColumn = (columnId: string) => {
    const now = new Date();
    let expectedCloseDate = null;

    switch (columnId) {
      case 'today':
        expectedCloseDate = now;
        break;
      case 'this_week':
        expectedCloseDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
        break;
      case 'next_week':
        expectedCloseDate = addWeeks(now, 1);
        break;
      case 'later':
        expectedCloseDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
        break;
      default:
        expectedCloseDate = null;
    }

    const dealData = {
      title: `New Deal - ${columnId.replace('_', ' ')}`,
      stage: 'qualification',
      status: 'open',
      value: 0,
      currency: 'USD',
      expectedCloseDate: expectedCloseDate ? expectedCloseDate.toISOString().split('T')[0] : null,
    };

    createDeal.mutate(dealData, {
      onSuccess: (newDeal) => {
        toast({
          title: "Deal created",
          description: `${newDeal.title} has been created successfully.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Failed to create deal",
          description: error?.message || "Please try again",
          variant: "destructive",
        });
      },
    });
  };

  // Function to handle configure button
  const handleConfigure = () => {
    toast({
      title: "Configuration",
      description: "CRM configuration panel will be available soon!",
    });
    // You can navigate to a configuration page when it's ready
    // navigate('/crm/configure');
  };

  // Categorize deals by their expected close date or activity date
  const categorizeDeals = (deals: any[]) => {
    const now = new Date();
    const nextWeekStart = addWeeks(now, 1);
    const nextWeekEnd = addWeeks(now, 2);

    const categories = {
      overdue: [] as any[],
      today: [] as any[],
      this_week: [] as any[],
      next_week: [] as any[],
      idle: [] as any[],
      later: [] as any[],
    };

    deals.forEach(deal => {
      const closeDate = deal.expected_close_date ? new Date(deal.expected_close_date) : null;
      
      if (!closeDate) {
        categories.idle.push(deal);
      } else if (isBefore(closeDate, now) && !isToday(closeDate)) {
        categories.overdue.push(deal);
      } else if (isToday(closeDate)) {
        categories.today.push(deal);
      } else if (isThisWeek(closeDate)) {
        categories.this_week.push(deal);
      } else if (isAfter(closeDate, nextWeekStart) && isBefore(closeDate, nextWeekEnd)) {
        categories.next_week.push(deal);
      } else {
        categories.later.push(deal);
      }
    });

    return categories;
  };

  const categorizedDeals = categorizeDeals(deals);

  // Update column counts
  const updatedColumns = activityColumns.map(column => ({
    ...column,
    count: categorizedDeals[column.id as keyof typeof categorizedDeals]?.length || 0,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-0 pb-4 min-w-max">
        {updatedColumns.map((column, index) => {
          const columnDeals = categorizedDeals[column.id as keyof typeof categorizedDeals] || [];
          
          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-56 border-r border-dashed border-border last:border-r-0"
            >
              {/* Column Header */}
              <div className={cn(
                "px-3 py-1.5",
                column.id === "overdue" && "bg-destructive text-destructive-foreground",
                column.id === "today" && "bg-success text-success-foreground",
                column.id === "this_week" && "bg-chart-1 text-white",
                column.id === "next_week" && "bg-chart-1 text-white",
                column.id === "idle" && "bg-muted text-muted-foreground",
                column.id === "later" && "bg-success text-success-foreground",
              )}>
                <span className="text-sm font-medium">
                  {column.name} ({column.count})
                </span>
              </div>

              {/* Column Content */}
              <div className="p-2 space-y-2 min-h-[500px]">
                {/* Quick Deal button - only in first column */}
                {index === 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-center gap-2 border-border bg-muted/50 text-foreground hover:bg-muted"
                    size="sm"
                    onClick={handleCreateQuickDeal}
                  >
                    <Plus className="h-4 w-4" />
                    Quick Deal
                  </Button>
                )}

                {/* Add button for other columns */}
                {index !== 0 && columnDeals.length === 0 && (
                  <div className="flex justify-center py-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCreateDealForColumn(column.id)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {/* Contact Center Card - only in first column */}
                {index === 0 && showInfoCard && (
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="font-medium text-sm">Contact Center</h4>
                        <p className="text-xs text-muted-foreground">Automatic deal sources</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 -mr-1 -mt-1"
                        onClick={() => setShowInfoCard(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-3 text-xs">
                      <div 
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Live Chat", description: "Live chat integration coming soon!" })}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Live Chat</span>
                      </div>
                      <div 
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Calls", description: "Call integration coming soon!" })}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Calls</span>
                      </div>
                      <div 
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "CRM Forms", description: "Form builder coming soon!" })}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>CRM forms</span>
                      </div>
                      <div 
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => navigate('/mail')}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Mail</span>
                      </div>
                      <div 
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Viber", description: "Viber integration coming soon!" })}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Viber</span>
                      </div>
                      <div 
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Telegram", description: "Telegram integration coming soon!" })}
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Telegram</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Import data from{" "}
                      <a href="#" className="text-primary hover:underline">other CRM</a>
                      {" "}or{" "}
                      <a href="#" className="text-primary hover:underline">Excel spreadsheet</a>
                    </p>
                  </div>
                )}

                {/* CRM Presets Card - only in second column (Due today) */}
                {index === 1 && showPresetsCard && (
                  <div className="rounded-lg border border-border bg-card p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">CRM solution presets</h4>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 -mr-1 -mt-1"
                        onClick={() => setShowPresetsCard(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div 
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Import", description: "Import feature coming soon!" })}
                      >
                        <Upload className="h-3.5 w-3.5 text-chart-1" />
                        <span>Import CRM solution presets from file</span>
                      </div>
                      <div 
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Export", description: "Export feature coming soon!" })}
                      >
                        <Download className="h-3.5 w-3.5 text-success" />
                        <span>Export CRM solution presets to file</span>
                      </div>
                      <div 
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Migration", description: "CRM migration feature coming soon!" })}
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 text-chart-4" />
                        <span>Migrate from other CRM</span>
                      </div>
                      <div 
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Marketplace", description: "Marketplace integration coming soon!" })}
                      >
                        <Store className="h-3.5 w-3.5 text-chart-3" />
                        <span>Get CRM solution preset from Bitrix24.Market</span>
                      </div>
                      <div 
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                        onClick={() => toast({ title: "Publish", description: "Publishing feature coming soon!" })}
                      >
                        <Share2 className="h-3.5 w-3.5 text-primary" />
                        <span>Publish your CRM solution preset to Bitrix24.Market</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-3 bg-success hover:bg-success/90 text-success-foreground" 
                      size="sm"
                      onClick={handleConfigure}
                    >
                      CONFIGURE
                    </Button>
                  </div>
                )}

                {/* Real deals column content */}
                {columnDeals.length > 0 && (
                  <div className="space-y-2">
                    {columnDeals.map((deal) => (
                      <div 
                        key={deal.id} 
                        className="rounded-lg border border-border bg-card p-3 relative cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/crm/deals/${deal.id}`)}
                      >
                        {/* Status indicator */}
                        <div className="absolute top-2 right-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            deal.status === 'won' ? 'bg-green-500' :
                            deal.status === 'lost' ? 'bg-red-500' :
                            'bg-blue-500'
                          )} />
                        </div>
                        
                        {/* Deal info */}
                        <h5 className="font-medium text-sm pr-4">{deal.title || deal.name}</h5>
                        <p className="text-sm font-semibold mt-1">
                          ${(deal.value || 0).toLocaleString()}
                        </p>
                        {deal.contact_first_name && (
                          <p className="text-sm text-primary hover:underline cursor-pointer mt-1">
                            {deal.contact_first_name} {deal.contact_last_name}
                          </p>
                        )}
                        {deal.company_name && (
                          <p className="text-xs text-primary hover:underline cursor-pointer">
                            {deal.company_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM dd, yyyy') : 'No due date'}
                        </p>

                        {/* Action icons */}
                        <div className="absolute top-2 right-6 flex flex-col gap-1">
                          <Phone 
                            className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle phone call
                              toast({
                                title: "Call feature",
                                description: "Phone integration coming soon!",
                              });
                            }}
                          />
                          <Mail 
                            className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle email
                              toast({
                                title: "Email feature",
                                description: "Email integration coming soon!",
                              });
                            }}
                          />
                          <MessageSquare 
                            className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle message
                              toast({
                                title: "Message feature",
                                description: "Messaging integration coming soon!",
                              });
                            }}
                          />
                        </div>

                        {/* Activity row */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                          <span 
                            className="text-xs text-muted-foreground hover:text-primary cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/crm/deals/${deal.id}?tab=activities`);
                            }}
                          >
                            + Activity
                          </span>
                          {deal.expected_close_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{format(new Date(deal.expected_close_date), 'MMM dd, yyyy')}</span>
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add button for columns with deals */}
                {columnDeals.length > 0 && (
                  <div className="flex justify-center py-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCreateDealForColumn(column.id)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}