import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer';
import { FunnelMetrics } from '../types';
import { CandidateProfilePage } from './candidate-profile-document';

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
    photoUrl?: string;
  }[];
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '1 solid #EEE',
    paddingBottom: 10,
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 2,
  },
  positionTitle: {
    fontSize: 16,
    color: '#555',
  },
  reportDate: {
    fontSize: 10,
    color: '#777',
    marginTop: 4,
  },
  funnelContainer: {
    border: '1 solid #EEE',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#F9F9F9'
  },
  funnelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#444'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '30%',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    border: '1 solid #EAEAEA',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    paddingBottom: 5,
    borderBottom: '2 solid #333',
    marginBottom: 15,
    marginTop: 10,
  },
});

const metricDisplayConfig: { [K in keyof FunnelMetrics]: { label: string } } = {
  sourced: { label: 'Sourced' },
  approached: { label: 'Approached' },
  notInterested: { label: 'Not Interested' },
  noResponse: { label: 'No Response' },
  activePipeline: { label: 'Active Pipeline' },
  shortlisted: { label: 'Shortlisted' },
  finalInterviews: { label: 'Final Interviews' },
};

const FunnelChart = ({ metrics }: { metrics: FunnelMetrics }) => {
  const total = metrics.sourced;
  if (total === 0) return null;

  const stages = [
    { label: 'Sourced', value: metrics.sourced, color: '#8884d8' },
    { label: 'Approached', value: metrics.approached, color: '#82ca9d' },
    { label: 'Active Pipeline', value: metrics.activePipeline, color: '#ffc658' },
    { label: 'Shortlisted', value: metrics.shortlisted, color: '#ff8042' },
    { label: 'Final Interviews', value: metrics.finalInterviews, color: '#00C49F' },
  ];

  const maxBarWidth = 100;

  return (
    <View style={{ width: '100%' }}>
      {stages.map((stage, index) => {
        const barWidth = total > 0 ? (stage.value / total) * maxBarWidth : 0;
        return (
          <View key={index} style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 9, color: '#555', marginBottom: 2 }}>{stage.label} ({stage.value})</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: `${barWidth}%`, backgroundColor: stage.color, height: 12, borderRadius: 3 }} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

export const PositionReportDocument = ({ data }: { data: PositionReportData }) => (
  <Document>
    <Page style={styles.page} size="A4">
      <View style={styles.header}>
        <Text style={styles.clientName}>{data.clientName}</Text>
        <Text style={styles.positionTitle}>{data.positionTitle}</Text>
        <Text style={styles.reportDate}>Report Date: {data.reportDate}</Text>
      </View>

      <View style={styles.funnelContainer}>
        <Text style={styles.funnelTitle}>Recruitment Funnel Overview</Text>
        
        <View style={styles.metricsGrid}>
          {Object.entries(metricDisplayConfig).map(([key, { label }]) => {
            const value = data.funnelMetrics[key as keyof FunnelMetrics];
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
          <FunnelChart metrics={data.funnelMetrics} />
        </View>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Candidate Profiles</Text>
      </View>
    </Page>

    {data.candidates.map((candidate, index) => (
      <CandidateProfilePage key={candidate.id} candidate={candidate} pageNumber={index + 2} />
    ))}
  </Document>
);