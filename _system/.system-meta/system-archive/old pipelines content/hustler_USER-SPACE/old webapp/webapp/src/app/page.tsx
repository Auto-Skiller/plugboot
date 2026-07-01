"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import Link from "next/link";
import { Wallet, Truck, AlertTriangle, TrendingUp, TrendingDown, Package, ShoppingCart, BarChart3, MapPin, Building2, CheckCircle, Store, DollarSign } from "lucide-react";
import { LifecycleFunnel } from "@/components/core/ui/lifecycle-funnel";
import { KPIGrid } from "@/components/core/ui/kpi-card";

import { InlineTabNavigation } from "@/components/core/ui/tab-navigation";
import { RevenueAreaChart, demoRevenueData, Sparkline, demoSparklineData, chartColors } from "@/components/core/ui/charts";
import { CardReveal, FadeInView } from "@/components/core/ui/page-transition";
import { AnimatedKPI, ScrollReveal, NumberTicker } from "@/components/core/ui/advanced-motion";
import { OrderFunnel, generateOrderStatusData, generateDeliveryCompanyData, DeliveryCompanyComparison } from "@/components/core/ui/charts/order-charts";
import { WilayaHeatmap, generateWilayaOrderData, WilayaDetailPanel } from "@/components/core/ui/maps/wilaya-heatmap";
import { wilayas, type Wilaya } from "@/lib/chart-utils";
import { useState, useMemo, useEffect } from "react";
import { Skeleton } from "@/components/core/ui/skeleton";
import { MOCK_ORDERS } from "@/lib/mock-data";

const DASHBOARD_TABS = [
  { value: "dash-overview", label: "Revenue", icon: <Wallet className="w-4 h-4" /> },
  { value: "dash-confirmations", label: "Confirmations", icon: <CheckCircle className="w-4 h-4" /> },
  { value: "dash-delivery", label: "Delivery", icon: <Truck className="w-4 h-4" /> },
];

export default function Home() {
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Local tab state (migrated from useRightPanel)
  const [dashboardTab, setDashboardTab] = useState("dash-overview");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Generate demo data
  const wilayaData = useMemo(() => generateWilayaOrderData(), []);
  const deliveryData = useMemo(() => generateDeliveryCompanyData(), []);
  const orderStatusData = useMemo(() => generateOrderStatusData(), []);

  // Calculate totals
  const totalOrders = wilayaData.reduce((sum, w) => sum + w.orders, 0);
  const totalRevenue = wilayaData.reduce((sum, w) => sum + w.revenue, 0);
  const avgDeliveryDays = deliveryData.reduce((sum, d) => sum + d.avgDays, 0) / deliveryData.length;
  const overallSuccessRate = (deliveryData.reduce((sum, d) => sum + d.delivered, 0) /
    deliveryData.reduce((sum, d) => sum + d.orders, 0)) * 100;

  const selectedWilayaData = selectedWilaya
    ? wilayaData.find(w => w.code === selectedWilaya.code)
    : undefined;



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-[350px]" />
          <Skeleton className="lg:col-span-3 h-[350px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 rounded-xl">

      {/* KPI Cards with Animated Numbers */}
      <KPIGrid columns={4}>
        <AnimatedKPI
          title="Total Orders"
          value={totalOrders}
          previousValue={Math.floor(totalOrders * 0.9)}
          icon={<Package className="h-5 w-5" />}
          index={0}
        />
        <AnimatedKPI
          title="Total Revenue"
          value={Math.floor(totalRevenue / 1000)}
          previousValue={Math.floor(totalRevenue * 0.85 / 1000)}
          suffix="K DZD"
          icon={<Wallet className="h-5 w-5" />}
          index={1}
        />
        <AnimatedKPI
          title="Avg Delivery"
          value={parseFloat(avgDeliveryDays.toFixed(1))}
          suffix=" days"
          icon={<Truck className="h-5 w-5" />}
          trend="neutral"
          index={2}
        />
        <AnimatedKPI
          title="Success Rate"
          value={parseFloat(overallSuccessRate.toFixed(1))}
          suffix="%"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={overallSuccessRate >= 85 ? "up" : "down"}
          index={3}
        />
      </KPIGrid>

      {/* Action Buttons */}
      <FadeInView delay={0.2}>
        <div className="flex items-center gap-3">
          <Link href="/admin/credits">
            <Button variant="outline" className="gap-2">
              <Wallet className="h-4 w-4" />
              Top Up Wallet
            </Button>
          </Link>
          <Button className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <ShoppingCart className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </FadeInView>

      {/* Tab Content */}
      {dashboardTab === "dash-overview" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <CardReveal index={0} className="lg:col-span-4">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-2">
                <div className="space-y-1 min-w-0">
                  <CardTitle>Revenue Overview</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center text-[hsl(var(--accent-green))] font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" /> +12.5%
                    </span>
                    vs previous period
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                  {["7d", "30d", "90d"].map((range) => (
                    <button
                      key={range}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${range === "30d"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <RevenueAreaChart
                  data={demoRevenueData}
                  dataKeys={["revenue", "prev_revenue"]}
                  colors={[chartColors.primary, chartColors.muted]}
                  height={280}
                  showGradient={true}
                  showLegend={true}
                />
              </CardContent>
            </Card>
          </CardReveal>

          <CardReveal index={1} className="lg:col-span-3">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Top Wilayas
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Performance by region
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wilayaData.slice(0, 5).map((data, index) => {
                    const wilaya = wilayas.find(w => w.code === data.code);
                    // Generate a random trend for demo purposes
                    const isUp = index !== 2;

                    return (
                      <div key={data.code} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-[hsl(var(--accent-orange))]' :
                          index === 1 ? 'bg-[hsl(var(--accent-blue))]' :
                            index === 2 ? 'bg-[hsl(var(--accent-green))]' : 'bg-muted text-muted-foreground'
                          }`}>
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium truncate">{wilaya?.nameFr || data.code}</span>
                            <span className="text-sm font-bold">
                              <NumberTicker value={data.orders} duration={1} />
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-8">
                              <Sparkline
                                data={demoSparklineData.map(v => v * (1 - index * 0.1))}
                                color={isUp ? chartColors.success : chartColors.error}
                                height={30}
                                showTrend={false}
                              />
                            </div>
                            <div className={`text-xs font-medium flex items-center ${isUp ? 'text-[hsl(var(--accent-green))]' : 'text-destructive'}`}>
                              {isUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                              {isUp ? '+' : '-'}{Math.floor(Math.random() * 10) + 2}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
                  <Link href="/analytics/heatmap">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Full Heatmap
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </CardReveal>
        </div>
      )}

      {/* Lifecycle Funnel - Always visible on overview */}
      {dashboardTab === "dash-overview" && (
        <CardReveal index={2}>
          <LifecycleFunnel />
        </CardReveal>
      )}

      {dashboardTab === "funnel" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <CardReveal index={0}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Order Conversion Funnel</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track order progression and drop-off points
                </p>
              </CardHeader>
              <CardContent>
                <OrderFunnel height={350} />
              </CardContent>
            </Card>
          </CardReveal>

          <CardReveal index={1}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Funnel Insights</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Key metrics and recommendations
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-[hsl(var(--accent-orange))]/10 border border-[hsl(var(--accent-orange))]/20">
                  <div className="flex items-center gap-2 text-[hsl(var(--accent-orange))] mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Attention Needed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    15% of confirmed orders are not being shipped. Consider following up with your fulfillment team.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[hsl(var(--accent-green))]/10 border border-[hsl(var(--accent-green))]/20">
                  <div className="flex items-center gap-2 text-[hsl(var(--accent-green))] mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Good Performance</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your delivery success rate is above average at 94%. Keep up the great work!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-primary">
                      <NumberTicker value={85} suffix="%" duration={1.5} />
                    </p>
                    <p className="text-xs text-muted-foreground">Confirmation Rate</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-[hsl(var(--accent-green))]">
                      <NumberTicker value={94} suffix="%" duration={1.5} />
                    </p>
                    <p className="text-xs text-muted-foreground">Delivery Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardReveal>
        </div>
      )}

      {/* Recent Orders Section - Always visible */}
      {
        dashboardTab === "dash-overview" && (
          <CardReveal index={2}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/ecommerce/orders">View All</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  You have 12 orders to confirm.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {MOCK_ORDERS.slice(0, 5).map((order, index) => (
                    <ScrollReveal key={index} delay={index * 0.05} direction="left">
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer active:scale-[0.99]">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.wilaya} • <NumberTicker value={parseFloat(order.total.replace(/[^\d]/g, ''))} duration={0.8} /> DA
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Processing' ? 'bg-[hsl(var(--accent-orange))]/20 text-[hsl(var(--accent-orange))]' :
                          order.status === 'Shipped' ? 'bg-[hsl(var(--accent-blue))]/20 text-[hsl(var(--accent-blue))]' :
                            order.status === 'Delivered' ? 'bg-[hsl(var(--accent-green))]/20 text-[hsl(var(--accent-green))]' :
                              'bg-destructive/20 text-destructive'
                          }`}>
                          {order.status}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardReveal>
        )
      }
    </div >
  );
}
