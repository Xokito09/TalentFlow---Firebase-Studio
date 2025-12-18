import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import { FunnelMetrics } from '../types';
import { CandidateProfileDocument } from './candidate-profile-document';

Font.registerHyphenationCallback((word) => [word]);

export interface PositionReportData {
  clientName: string;
  positionTitle: string;
  reportDate: string;
  funnelMetrics: FunnelMetrics;
  candidates: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
    linkedin?: string;
    projectRole: string;
    compensation?: string;
    academicBackground?: string | string[];
    languages?: string[] | string;
    professionalBackground?: string;
    mainProjects?: string[] | string;
    hardSkills?: string[] | string;
    photoDataUrl?: string | null;
  }[];
}

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    clientName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E40AF',
    },
    positionTitle: {
        fontSize: 18,
        color: '#4B5563',
    },
    reportDate: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    funnelContainer: {
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
    },
    funnelTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    metricItem: {
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    metricLabel: {
        fontSize: 10,
        color: '#6B7280',
    },
    chartContainer: {
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: 5,
    },
});

const metricDisplayConfig = {
    shortlist: { label: 'Shortlisted' },
    firstInterview: { label: '1st Interview' },
    secondInterview: { label: '2nd Interview' },
    offer: { label: 'Offer' },
    hired: { label: 'Hired' },
};

const FunnelChart = ({ metrics }: { metrics: FunnelMetrics }) => {
    const stageKeys = Object.keys(metricDisplayConfig) as (keyof FunnelMetrics)[];
    const total = Math.max(...stageKeys.map(key => metrics[key] || 0));
    const barWidth = 400;

    return (
        <View style={{ width: barWidth }}>
            {stageKeys.map((key) => {
                const value = metrics[key] || 0;
                const width = total > 0 ? (value / total) * barWidth : 0;
                return (
                    <View key={key} style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 10, marginBottom: 2 }}>{metricDisplayConfig[key].label} ({value})</Text>
                        <View style={{ width: barWidth, height: 15, backgroundColor: '#E5E7EB', borderRadius: 4 }}>
                            <View style={{ width, height: 15, backgroundColor: '#3B82F6', borderRadius: 4 }} />
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

export const PositionReportDocument = ({ clientName, positionTitle, reportDate, funnelMetrics, candidates }: PositionReportData) => (
  <Document>
    <Page style={styles.page} size="A4">
      <View style={styles.header}>
        <Text style={styles.clientName}>{clientName}</Text>
        <Text style={styles.positionTitle}>{positionTitle}</Text>
        <Text style={styles.reportDate}>Report Date: {reportDate}</Text>
      </View>

      <View style={styles.funnelContainer}>
        <Text style={styles.funnelTitle}>Recruitment Funnel Overview</Text>
        
        <View style={styles.metricsGrid}>
          {Object.entries(metricDisplayConfig).map(([key, { label }]) => {
            const value = funnelMetrics[key as keyof FunnelMetrics];
            if (value === undefined) return null;
            return (
              <View key={key} style={styles.metricItem}>
                <Text style={styles.metricValue}>{value}</Text>
                <Text style={styles.metricLabel}>{label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartContainer}>
          <FunnelChart metrics={funnelMetrics} />
        </View>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Candidate Profiles</Text>
      </View>
    </Page>

    {candidates.map((candidate, index) => (
      <CandidateProfileDocument key={candidate.id} {...candidate} pageNumber={index + 2} />
    ))}
  </Document>
);
