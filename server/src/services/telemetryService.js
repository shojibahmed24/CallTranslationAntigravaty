import { v4 as uuidv4 } from 'uuid';
import supabase from '../database/supabaseClient.js';

class TelemetryService {
  async recordCallMetric({ callId, pair, durationSeconds, avgLatencyMs, packetLossPercent = 0.1, bargeInEvents = 0, success = true, failureReason = null }) {
    const metric = {
      id: `tel_${uuidv4().substring(0, 8)}`,
      call_id: callId,
      pair,
      duration_seconds: durationSeconds,
      avg_latency_ms: Math.round(avgLatencyMs),
      packet_loss_percent: Number(packetLossPercent.toFixed(2)),
      barge_in_events: bargeInEvents,
      success,
      failure_reason: failureReason
    };

    try {
      await supabase.from('telemetry').insert([metric]);
    } catch (err) {
      console.error('Failed to insert telemetry', err);
    }
    
    return metric;
  }

  async getAggregatedStats() {
    try {
      const { data: records, error } = await supabase.from('telemetry').select('*').order('timestamp', { ascending: false }).limit(500);
      if (error) throw error;

      const totalCalls = records.length;
      const successfulCalls = records.filter(r => r.success).length;
      const successRate = totalCalls > 0 ? ((successfulCalls / totalCalls) * 100).toFixed(1) : '100.0';
      
      const avgLatency = totalCalls > 0 
        ? Math.round(records.reduce((acc, r) => acc + (r.avg_latency_ms || 0), 0) / totalCalls)
        : 120;

      const totalMinutes = Math.round(records.reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / 60);

      return {
        totalCallsTracked: totalCalls,
        successRatePercent: parseFloat(successRate),
        avgLatencyMs: avgLatency,
        totalTranslatedMinutes: totalMinutes,
        recentMetrics: records.slice(0, 20)
      };
    } catch (err) {
      console.error('Telemetry aggregation error:', err);
      return {
        totalCallsTracked: 0,
        successRatePercent: 100.0,
        avgLatencyMs: 120,
        totalTranslatedMinutes: 0,
        recentMetrics: []
      };
    }
  }
}

export const telemetryService = new TelemetryService();
