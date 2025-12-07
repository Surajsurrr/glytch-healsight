/**
 * AI Analytics Engine for Glytch Med Platform
 * 
 * Analyzes:
 * - Business performance & feasibility
 * - User behavior & patterns
 * - Product ordering trends
 * - Doctor specialization demand
 * - Patient preferences & interests
 * - System scalability & bottlenecks
 * - Revenue optimization opportunities
 */

const mongoose = require('mongoose');

class AIAnalyticsEngine {
  /**
   * Analyze product ordering patterns and trends
   */
  static async analyzeProductTrends(orders) {
    const productFrequency = {};
    const productRevenue = {};
    const productGrowth = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.product?._id?.toString() || item.product;
        const productName = item.product?.name || item.productName || 'Unknown';
        
        if (!productFrequency[productName]) {
          productFrequency[productName] = { count: 0, revenue: 0, productId };
        }
        
        productFrequency[productName].count += item.quantity || 1;
        productFrequency[productName].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    
    // Sort by frequency
    const topProducts = Object.entries(productFrequency)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate growth trends
    const last30Days = orders.filter(o => 
      new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const prev30Days = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
             date <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    });
    
    const growthRate = prev30Days.length > 0 
      ? ((last30Days.length - prev30Days.length) / prev30Days.length * 100).toFixed(1)
      : 0;
    
    return {
      topProducts,
      totalOrders: orders.length,
      growthRate: parseFloat(growthRate),
      insights: this.generateProductInsights(topProducts, growthRate)
    };
  }
  
  /**
   * Analyze doctor specialization demand and performance
   */
  static async analyzeDoctorSpecializations(appointments, doctors) {
    const specializationDemand = {};
    const doctorPerformance = {};
    
    // Count appointments by specialization
    appointments.forEach(apt => {
      const spec = apt.doctor?.specialization || apt.specialization || 'General';
      const doctorId = apt.doctor?._id?.toString();
      
      if (!specializationDemand[spec]) {
        specializationDemand[spec] = { count: 0, doctors: new Set() };
      }
      specializationDemand[spec].count++;
      if (doctorId) specializationDemand[spec].doctors.add(doctorId);
      
      // Track doctor performance
      if (doctorId) {
        if (!doctorPerformance[doctorId]) {
          doctorPerformance[doctorId] = {
            name: `${apt.doctor?.firstName || ''} ${apt.doctor?.lastName || ''}`.trim(),
            specialization: spec,
            totalAppointments: 0,
            completed: 0,
            cancelled: 0,
            rating: 0
          };
        }
        doctorPerformance[doctorId].totalAppointments++;
        if (apt.status === 'completed') doctorPerformance[doctorId].completed++;
        if (apt.status === 'cancelled') doctorPerformance[doctorId].cancelled++;
      }
    });
    
    // Format specialization demand
    const topSpecializations = Object.entries(specializationDemand)
      .map(([name, data]) => ({
        specialization: name,
        demand: data.count,
        doctorCount: data.doctors.size,
        demandPerDoctor: data.doctors.size > 0 ? (data.count / data.doctors.size).toFixed(1) : 0
      }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);
    
    // Top performing doctors
    const topDoctors = Object.values(doctorPerformance)
      .sort((a, b) => b.totalAppointments - a.totalAppointments)
      .slice(0, 10);
    
    return {
      topSpecializations,
      topDoctors,
      insights: this.generateDoctorInsights(topSpecializations, topDoctors)
    };
  }
  
  /**
   * Analyze patient behavior and interests
   */
  static async analyzePatientBehavior(patients, appointments, visits) {
    const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
    const genderDistribution = { male: 0, female: 0, other: 0 };
    const appointmentFrequency = {};
    const healthConditions = {};
    
    patients.forEach(patient => {
      // Age analysis
      const age = patient.age || this.calculateAge(patient.dateOfBirth);
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;
      
      // Gender distribution
      const gender = (patient.gender || 'other').toLowerCase();
      if (gender in genderDistribution) genderDistribution[gender]++;
      else genderDistribution.other++;
      
      // Track appointment frequency per patient
      const patientId = patient._id?.toString();
      const patientAppointments = appointments.filter(a => 
        a.patient?._id?.toString() === patientId || a.patientId?.toString() === patientId
      );
      
      if (patientAppointments.length > 0) {
        const frequency = patientAppointments.length > 5 ? 'high' : 
                         patientAppointments.length > 2 ? 'medium' : 'low';
        appointmentFrequency[frequency] = (appointmentFrequency[frequency] || 0) + 1;
      }
    });
    
    // Analyze health interests (from visits/diagnoses)
    visits.forEach(visit => {
      const condition = visit.diagnosis || visit.reason || 'General Checkup';
      healthConditions[condition] = (healthConditions[condition] || 0) + 1;
    });
    
    const topHealthConcerns = Object.entries(healthConditions)
      .map(([condition, count]) => ({ condition, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      demographics: {
        ageGroups,
        genderDistribution,
        totalPatients: patients.length
      },
      appointmentFrequency,
      topHealthConcerns,
      insights: this.generatePatientInsights(ageGroups, genderDistribution, topHealthConcerns)
    };
  }
  
  /**
   * Analyze system scalability and performance
   */
  static async analyzeScalability(stats) {
    const metrics = {
      userGrowth: stats.userGrowth || [],
      appointmentLoad: stats.appointmentLoad || 0,
      systemCapacity: stats.systemCapacity || 100,
      responseTime: stats.avgResponseTime || 0,
      errorRate: stats.errorRate || 0
    };
    
    // Calculate growth trends
    const growthTrend = this.calculateGrowthTrend(metrics.userGrowth);
    
    // Identify bottlenecks
    const bottlenecks = [];
    if (metrics.appointmentLoad > 80) {
      bottlenecks.push({
        area: 'Appointment Management',
        severity: 'high',
        issue: 'System approaching capacity limit',
        recommendation: 'Consider load balancing or capacity expansion'
      });
    }
    
    if (metrics.errorRate > 5) {
      bottlenecks.push({
        area: 'System Reliability',
        severity: 'high',
        issue: `High error rate: ${metrics.errorRate}%`,
        recommendation: 'Review error logs and implement error handling improvements'
      });
    }
    
    if (metrics.responseTime > 2000) {
      bottlenecks.push({
        area: 'Performance',
        severity: 'medium',
        issue: 'Slow response times detected',
        recommendation: 'Optimize database queries and implement caching'
      });
    }
    
    return {
      metrics,
      growthTrend,
      bottlenecks,
      scalabilityScore: this.calculateScalabilityScore(metrics, bottlenecks),
      insights: this.generateScalabilityInsights(metrics, bottlenecks, growthTrend)
    };
  }
  
  /**
   * Analyze business feasibility and revenue
   */
  static async analyzeBusinessFeasibility(orders, appointments, products) {
    const revenue = {
      total: 0,
      fromProducts: 0,
      fromAppointments: 0,
      monthly: []
    };
    
    // Calculate revenue from orders
    orders.forEach(order => {
      const orderTotal = order.totalAmount || 0;
      revenue.total += orderTotal;
      revenue.fromProducts += orderTotal;
    });
    
    // Calculate revenue from appointments (if applicable)
    appointments.forEach(apt => {
      const fee = apt.consultationFee || apt.fee || 0;
      revenue.total += fee;
      revenue.fromAppointments += fee;
    });
    
    // Calculate monthly revenue trend
    const monthlyData = this.calculateMonthlyRevenue(orders, appointments);
    revenue.monthly = monthlyData;
    
    // Calculate profitability metrics
    const avgOrderValue = orders.length > 0 ? revenue.fromProducts / orders.length : 0;
    const avgAppointmentFee = appointments.length > 0 ? revenue.fromAppointments / appointments.length : 0;
    
    // Business health indicators
    const healthScore = this.calculateBusinessHealth(revenue, orders, appointments);
    
    return {
      revenue,
      metrics: {
        avgOrderValue: avgOrderValue.toFixed(2),
        avgAppointmentFee: avgAppointmentFee.toFixed(2),
        totalTransactions: orders.length + appointments.length,
        healthScore
      },
      insights: this.generateBusinessInsights(revenue, healthScore, monthlyData)
    };
  }
  
  /**
   * Generate comprehensive AI recommendations
   */
  static generateRecommendations(allAnalytics) {
    const recommendations = [];
    
    // Product recommendations
    if (allAnalytics.products?.topProducts?.length > 0) {
      const topProduct = allAnalytics.products.topProducts[0];
      recommendations.push({
        category: 'Products',
        priority: 'high',
        title: 'Optimize Top Product Inventory',
        description: `"${topProduct.name}" is your most ordered product. Ensure adequate stock levels and consider bundle offers.`,
        action: 'Increase inventory and create promotional campaigns',
        impact: 'high'
      });
      
      if (allAnalytics.products.growthRate > 20) {
        recommendations.push({
          category: 'Growth',
          priority: 'high',
          title: 'Scale Product Operations',
          description: `Product orders growing at ${allAnalytics.products.growthRate}% monthly. Prepare for increased demand.`,
          action: 'Expand supplier relationships and storage capacity',
          impact: 'high'
        });
      }
    }
    
    // Doctor specialization recommendations
    if (allAnalytics.doctors?.topSpecializations?.length > 0) {
      const topSpec = allAnalytics.doctors.topSpecializations[0];
      if (topSpec.demandPerDoctor > 15) {
        recommendations.push({
          category: 'Doctors',
          priority: 'high',
          title: `High Demand for ${topSpec.specialization} Specialists`,
          description: `Each ${topSpec.specialization} doctor handles ${topSpec.demandPerDoctor} appointments. Consider recruiting more specialists.`,
          action: `Recruit 2-3 additional ${topSpec.specialization} specialists`,
          impact: 'high'
        });
      }
    }
    
    // Patient engagement recommendations
    if (allAnalytics.patients?.appointmentFrequency) {
      const lowEngagement = allAnalytics.patients.appointmentFrequency.low || 0;
      const total = Object.values(allAnalytics.patients.appointmentFrequency).reduce((a, b) => a + b, 0);
      if (lowEngagement / total > 0.6) {
        recommendations.push({
          category: 'Patient Engagement',
          priority: 'medium',
          title: 'Improve Patient Retention',
          description: 'Over 60% of patients have low appointment frequency. Implement retention strategies.',
          action: 'Launch follow-up campaigns, wellness programs, and loyalty rewards',
          impact: 'medium'
        });
      }
    }
    
    // Scalability recommendations
    if (allAnalytics.scalability?.bottlenecks?.length > 0) {
      allAnalytics.scalability.bottlenecks.forEach(bottleneck => {
        recommendations.push({
          category: 'System Performance',
          priority: bottleneck.severity,
          title: bottleneck.issue,
          description: `Issue in ${bottleneck.area}`,
          action: bottleneck.recommendation,
          impact: bottleneck.severity
        });
      });
    }
    
    // Business feasibility recommendations
    if (allAnalytics.business?.metrics?.healthScore < 60) {
      recommendations.push({
        category: 'Business Health',
        priority: 'high',
        title: 'Business Health Needs Attention',
        description: `Current health score: ${allAnalytics.business.metrics.healthScore}/100. Revenue and engagement need improvement.`,
        action: 'Review pricing strategy, marketing campaigns, and user acquisition channels',
        impact: 'critical'
      });
    }
    
    // General growth recommendations
    recommendations.push({
      category: 'Growth Strategy',
      priority: 'medium',
      title: 'Expand Service Offerings',
      description: 'Based on user behavior, consider adding telemedicine, wellness packages, and preventive care programs.',
      action: 'Conduct market research and pilot new service categories',
      impact: 'medium'
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
  
  // Helper methods
  
  static generateProductInsights(topProducts, growthRate) {
    const insights = [];
    if (topProducts.length > 0) {
      insights.push(`"${topProducts[0].name}" is the most frequently ordered product with ${topProducts[0].count} orders.`);
    }
    if (growthRate > 10) {
      insights.push(`Product orders are growing at ${growthRate}% monthly - strong growth indicator.`);
    } else if (growthRate < 0) {
      insights.push(`Product orders declined by ${Math.abs(growthRate)}% - investigate market factors.`);
    }
    return insights;
  }
  
  static generateDoctorInsights(topSpecializations, topDoctors) {
    const insights = [];
    if (topSpecializations.length > 0) {
      const top = topSpecializations[0];
      insights.push(`${top.specialization} is the most in-demand specialization with ${top.demand} appointments.`);
      if (top.demandPerDoctor > 20) {
        insights.push(`High workload detected: ${top.demandPerDoctor} appointments per ${top.specialization} doctor.`);
      }
    }
    return insights;
  }
  
  static generatePatientInsights(ageGroups, genderDistribution, healthConcerns) {
    const insights = [];
    const dominantAge = Object.entries(ageGroups).sort((a, b) => b[1] - a[1])[0];
    insights.push(`Primary patient demographic: ${dominantAge[0]} age group (${dominantAge[1]} patients).`);
    
    if (healthConcerns.length > 0) {
      insights.push(`Most common health concern: "${healthConcerns[0].condition}" (${healthConcerns[0].count} cases).`);
    }
    return insights;
  }
  
  static generateScalabilityInsights(metrics, bottlenecks, growthTrend) {
    const insights = [];
    if (bottlenecks.length === 0) {
      insights.push('System is operating within normal parameters with no critical bottlenecks.');
    } else {
      insights.push(`${bottlenecks.length} performance bottleneck(s) detected requiring attention.`);
    }
    
    if (growthTrend > 0) {
      insights.push(`User base growing at ${growthTrend.toFixed(1)}% - ensure infrastructure can scale.`);
    }
    return insights;
  }
  
  static generateBusinessInsights(revenue, healthScore, monthlyData) {
    const insights = [];
    insights.push(`Total platform revenue: $${revenue.total.toFixed(2)}`);
    insights.push(`Business health score: ${healthScore}/100`);
    
    if (monthlyData.length >= 2) {
      const latest = monthlyData[monthlyData.length - 1].total;
      const previous = monthlyData[monthlyData.length - 2].total;
      const growth = ((latest - previous) / previous * 100).toFixed(1);
      insights.push(`Month-over-month revenue ${growth > 0 ? 'growth' : 'decline'}: ${Math.abs(growth)}%`);
    }
    return insights;
  }
  
  static calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  
  static calculateGrowthTrend(userGrowth) {
    if (!userGrowth || userGrowth.length < 2) return 0;
    const recent = userGrowth.slice(-2);
    return ((recent[1] - recent[0]) / recent[0] * 100);
  }
  
  static calculateScalabilityScore(metrics, bottlenecks) {
    let score = 100;
    score -= bottlenecks.length * 15;
    if (metrics.errorRate > 5) score -= 20;
    if (metrics.responseTime > 2000) score -= 15;
    if (metrics.appointmentLoad > 80) score -= 10;
    return Math.max(0, score);
  }
  
  static calculateBusinessHealth(revenue, orders, appointments) {
    let score = 50;
    if (revenue.total > 10000) score += 20;
    if (orders.length > 100) score += 15;
    if (appointments.length > 200) score += 15;
    return Math.min(100, score);
  }
  
  static calculateMonthlyRevenue(orders, appointments) {
    const monthly = {};
    
    orders.forEach(order => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7);
      if (!monthly[month]) monthly[month] = { products: 0, appointments: 0, total: 0 };
      const amount = order.totalAmount || 0;
      monthly[month].products += amount;
      monthly[month].total += amount;
    });
    
    appointments.forEach(apt => {
      const month = new Date(apt.createdAt).toISOString().slice(0, 7);
      if (!monthly[month]) monthly[month] = { products: 0, appointments: 0, total: 0 };
      const fee = apt.consultationFee || apt.fee || 0;
      monthly[month].appointments += fee;
      monthly[month].total += fee;
    });
    
    return Object.entries(monthly)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }
}

module.exports = AIAnalyticsEngine;
