import { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowDownRight,
  ArrowUpRight,
  BadgeIndianRupee,
  CircleAlert,
  ClipboardList,
  Radar,
  ShieldAlert,
  UserRound,
  Wallet,
} from 'lucide-react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const formatCurrency = (value) => currency.format(Number(value || 0));
const formatPercent = (value) => `${Math.round(Number(value || 0) * 100)}%`;

function buildFallbackDashboard() {
  return {
    generatedAt: new Date().toISOString(),
    overview: {
      totalClaimsToday: 28,
      totalPayoutToday: 186400,
      activePolicies: 1248,
      activeWorkerSessions: 362,
    },
    recentClaims: [
      {
        id: 'claim-1',
        userName: 'Riya Sharma',
        city: 'Mumbai',
        disruption: 'Rain',
        payout: 4600,
        confidenceScore: 0.92,
        status: 'FULL',
        createdAt: new Date().toISOString(),
        suspicious: false,
        suspiciousReasons: [],
      },
      {
        id: 'claim-2',
        userName: 'Arjun Patel',
        city: 'Pune',
        disruption: 'Heat',
        payout: 2100,
        confidenceScore: 0.68,
        status: 'REVIEW',
        createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        suspicious: true,
        suspiciousReasons: ['Low confidence', 'Abnormal duration'],
      },
      {
        id: 'claim-3',
        userName: 'Neha Khan',
        city: 'Delhi',
        disruption: 'Strike',
        payout: 3200,
        confidenceScore: 0.77,
        status: 'PARTIAL',
        createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
        suspicious: true,
        suspiciousReasons: ['Repeated claims in 24h'],
      },
      {
        id: 'claim-4',
        userName: 'Kabir Das',
        city: 'Kolkata',
        disruption: 'Rain',
        payout: 5100,
        confidenceScore: 0.88,
        status: 'FULL',
        createdAt: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
        suspicious: false,
        suspiciousReasons: [],
      },
    ],
    fraudAlerts: [
      {
        id: 'fraud-1',
        user: 'Arjun Patel',
        confidence: 0.46,
        reason: 'Low movement signature with weak environmental match',
        signal: 'Low confidence',
        severity: 'high',
      },
      {
        id: 'fraud-2',
        user: 'Neha Khan',
        confidence: 0.68,
        reason: '3 claims submitted in the last 24 hours',
        signal: 'Repeated claims',
        severity: 'medium',
      },
      {
        id: 'fraud-3',
        user: 'Sonal Gupta',
        confidence: 0.62,
        reason: 'Claimed 7.1 lost hours against a usual 8h workday',
        signal: 'Abnormal duration',
        severity: 'medium',
      },
    ],
    payouts: {
      today: 186400,
      week: 942300,
      averagePerClaim: 3569,
      recentActivity: [
        {
          id: 'pay-1',
          userName: 'Riya Sharma',
          payout: 4600,
          status: 'FULL',
          disruption: 'Rain',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'pay-2',
          userName: 'Kabir Das',
          payout: 5100,
          status: 'FULL',
          disruption: 'Rain',
          createdAt: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
        },
        {
          id: 'pay-3',
          userName: 'Neha Khan',
          payout: 3200,
          status: 'PARTIAL',
          disruption: 'Strike',
          createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
        },
      ],
    },
    risk: {
      nextWeekRisk: 'HIGH',
      summary: 'Heavy rainfall concentration and rising claim volume suggest elevated payout exposure next week.',
      drivers: [
        { label: 'Rainfall stress', value: '81%' },
        { label: 'Heat stress', value: '61%' },
        { label: 'Air quality stress', value: '54%' },
        { label: 'Avg confidence', value: '73%' },
      ],
    },
    systemHealth: {
      claimTrendDirection: 'increasing',
      claimTrendPercent: 18.4,
      fraudAlertsCount: 5,
      highRiskZones: [
        { city: 'Mumbai', claimCount: 12, totalPayout: 186000 },
        { city: 'Pune', claimCount: 9, totalPayout: 128500 },
        { city: 'Delhi', claimCount: 7, totalPayout: 104200 },
      ],
      headline: 'Claim frequency is increasing with 5 active fraud signals.',
      uptimeStatus: 'Live',
      lastSynced: new Date().toISOString(),
      reviewQueue: 3,
    },
  };
}

function MetricCard({ title, value, change, tone, icon: Icon, footnote }) {
  return (
    <section className="metric-card">
      <div className="metric-card__header">
        <span>{title}</span>
        <Icon size={18} />
      </div>
      <div className="metric-card__value">{value}</div>
      <div className={`metric-card__change metric-card__change--${tone}`}>
        {tone === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span>{change}</span>
      </div>
      <p className="metric-card__footnote">{footnote}</p>
    </section>
  );
}

function ClaimsTable({ claims }) {
  return (
    <section className="panel panel--wide">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Claims Monitoring</p>
          <h2>Recent claims and review signals</h2>
        </div>
        <span className="panel__badge">{claims.length} recent</span>
      </div>

      <div className="claims-table">
        <div className="claims-table__head">
          <span>User</span>
          <span>Disruption</span>
          <span>Payout</span>
          <span>Confidence</span>
          <span>Status</span>
          <span>Flag</span>
        </div>

        {claims.map((claim) => (
          <article key={claim.id} className="claims-row">
            <div>
              <strong>{claim.userName}</strong>
              <small>{claim.city}</small>
            </div>
            <div>{claim.disruption}</div>
            <div>{formatCurrency(claim.payout)}</div>
            <div>
              <span className={`confidence confidence--${getConfidenceTone(claim.confidenceScore)}`}>
                {formatPercent(claim.confidenceScore)}
              </span>
            </div>
            <div>
              <span className={`status-pill status-pill--${claim.status.toLowerCase()}`}>
                {claim.status}
              </span>
            </div>
            <div className="claims-row__flag">
              {claim.suspicious ? (
                <>
                  <span className="warning-inline">
                    <CircleAlert size={14} />
                    Needs attention
                  </span>
                  <small>{claim.suspiciousReasons.join(' / ')}</small>
                </>
              ) : (
                <>
                  <span className="ok-inline">Normal</span>
                  <small>{timeFormatter.format(new Date(claim.createdAt))}</small>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FraudPanel({ alerts }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Fraud Detection</p>
          <h2>Suspicious activity</h2>
        </div>
        <ShieldAlert size={18} />
      </div>

      <div className="stack">
        {alerts.length === 0 ? (
          <div className="empty-state">No fraud alerts right now.</div>
        ) : (
          alerts.map((alert) => (
            <article key={alert.id} className={`alert-card alert-card--${alert.severity}`}>
              <div className="alert-card__top">
                <strong>{alert.user}</strong>
                <span>{formatPercent(alert.confidence)}</span>
              </div>
              <p>{alert.reason}</p>
              <small>{alert.signal}</small>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function PayoutPanel({ payouts }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Payout Tracking</p>
          <h2>Exposure snapshot</h2>
        </div>
        <Wallet size={18} />
      </div>

      <div className="payout-grid">
        <div className="payout-stat">
          <span>Today</span>
          <strong>{formatCurrency(payouts.today)}</strong>
        </div>
        <div className="payout-stat">
          <span>This week</span>
          <strong>{formatCurrency(payouts.week)}</strong>
        </div>
        <div className="payout-stat payout-stat--full">
          <span>Average payout per claim</span>
          <strong>{formatCurrency(payouts.averagePerClaim)}</strong>
        </div>
      </div>

      <div className="activity-list">
        {payouts.recentActivity.map((activity) => (
          <div key={activity.id} className="activity-row">
            <div>
              <strong>{activity.userName}</strong>
              <small>{activity.disruption}</small>
            </div>
            <div>
              <strong>{formatCurrency(activity.payout)}</strong>
              <small>{dateTimeFormatter.format(new Date(activity.createdAt))}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskPanel({ risk }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Risk Prediction</p>
          <h2>What will happen next</h2>
        </div>
        <Radar size={18} />
      </div>

      <div className={`risk-banner risk-banner--${risk.nextWeekRisk.toLowerCase()}`}>
        <span>Next week risk</span>
        <strong>{risk.nextWeekRisk}</strong>
        <p>{risk.summary}</p>
      </div>

      <div className="driver-list">
        {risk.drivers.map((driver) => (
          <div key={driver.label} className="driver-row">
            <span>{driver.label}</span>
            <strong>{driver.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function HealthPanel({ health }) {
  const trendTone = health.claimTrendDirection === 'decreasing' ? 'down' : 'up';

  return (
    <section className="panel panel--wide">
      <div className="panel__header">
        <div>
          <p className="eyebrow">System Health</p>
          <h2>Operational insights</h2>
        </div>
        <Activity size={18} />
      </div>

      <div className="health-grid">
        <div className="health-card">
          <span>Claim frequency</span>
          <strong>{health.claimTrendDirection}</strong>
          <div className={`metric-card__change metric-card__change--${trendTone}`}>
            {trendTone === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(health.claimTrendPercent)}% vs previous week</span>
          </div>
        </div>

        <div className="health-card">
          <span>Fraud alerts</span>
          <strong>{health.fraudAlertsCount}</strong>
          <small>{health.reviewQueue} claims in review queue</small>
        </div>

        <div className="health-card">
          <span>System state</span>
          <strong>{health.uptimeStatus}</strong>
          <small>Last synced {dateTimeFormatter.format(new Date(health.lastSynced))}</small>
        </div>
      </div>

      <div className="headline-box">{health.headline}</div>

      <div className="zones">
        <div className="zones__header">
          <span>High-risk zones</span>
          <span>Total payout pressure</span>
        </div>
        {health.highRiskZones.map((zone) => (
          <div key={zone.city} className="zone-row">
            <div>
              <strong>{zone.city}</strong>
              <small>{zone.claimCount} claims</small>
            </div>
            <strong>{formatCurrency(zone.totalPayout)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function getConfidenceTone(score) {
  if (score >= 0.8) return 'good';
  if (score >= 0.7) return 'watch';
  return 'risk';
}

export default function App() {
  const [dashboard, setDashboard] = useState(buildFallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let alive = true;

    const loadDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/admin/dashboard`);
        if (!response.ok) throw new Error(`Admin dashboard request failed: ${response.status}`);
        const payload = await response.json();
        if (!alive) return;
        setDashboard(payload);
        setUsingFallback(false);
      } catch (error) {
        if (!alive) return;
        console.warn('Admin dashboard is using fallback data:', error);
        setDashboard(buildFallbackDashboard());
        setUsingFallback(true);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadDashboard();
    const timer = setInterval(loadDashboard, 30000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const { overview, recentClaims, fraudAlerts, payouts, risk, systemHealth } = dashboard;

  return (
    <div className="dashboard-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">InsureGig Admin Control Center</p>
          <h1>Real-time oversight for claims, fraud, payouts, and risk.</h1>
          <p className="hero__copy">
            See what is happening now, what needs review, and where next week&apos;s exposure is building.
          </p>
        </div>

        <div className="hero__meta">
          <div className="live-pill">
            <span className="live-pill__dot" />
            {usingFallback ? 'Demo data mode' : 'Live monitoring'}
          </div>
          <small>
            Last refresh {dateTimeFormatter.format(new Date(dashboard.generatedAt))}
          </small>
        </div>
      </header>

      {loading ? (
        <section className="loading-panel">
          <Activity size={24} className="spin" />
          <span>Loading control center...</span>
        </section>
      ) : (
        <>
          <section className="metrics-grid">
            <MetricCard
              title="Total claims today"
              value={overview.totalClaimsToday}
              change={`${recentClaims.filter((claim) => claim.suspicious).length} flagged claims`}
              tone="up"
              icon={ClipboardList}
              footnote="Tracks disruption volume across active workers."
            />
            <MetricCard
              title="Total payout amount"
              value={formatCurrency(overview.totalPayoutToday)}
              change={`${formatCurrency(payouts.averagePerClaim)} avg per claim`}
              tone="up"
              icon={BadgeIndianRupee}
              footnote="Immediate view of today's payout exposure."
            />
            <MetricCard
              title="Active policies"
              value={overview.activePolicies}
              change={`${systemHealth.highRiskZones.length} high-risk zones`}
              tone="up"
              icon={UserRound}
              footnote="Current policies eligible for automated coverage."
            />
            <MetricCard
              title="Active worker sessions"
              value={overview.activeWorkerSessions}
              change={`${systemHealth.reviewQueue} in review`}
              tone="down"
              icon={Activity}
              footnote="Sessions being monitored for live triggers."
            />
          </section>

          <section className="content-grid">
            <ClaimsTable claims={recentClaims} />
            <FraudPanel alerts={fraudAlerts} />
            <PayoutPanel payouts={payouts} />
            <RiskPanel risk={risk} />
            <HealthPanel health={systemHealth} />
            <section className="panel">
              <div className="panel__header">
                <div>
                  <p className="eyebrow">Decision Lens</p>
                  <h2>What matters right now</h2>
                </div>
                <AlertOctagon size={18} />
              </div>

              <div className="decision-list">
                <div className="decision-item">
                  <strong>Fraud pressure</strong>
                  <p>
                    {fraudAlerts.length > 0
                      ? `${fraudAlerts.length} suspicious behaviors need manual review.`
                      : 'No active fraud signals are breaching thresholds.'}
                  </p>
                </div>
                <div className="decision-item">
                  <strong>Payout exposure</strong>
                  <p>{formatCurrency(payouts.week)} paid this week across recent disruptions.</p>
                </div>
                <div className="decision-item">
                  <strong>Near-term forecast</strong>
                  <p>{risk.summary}</p>
                </div>
              </div>
            </section>
          </section>
        </>
      )}
    </div>
  );
}
