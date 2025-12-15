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
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    padding: 0,
    flexDirection: 'column',
  },
  headerContainer: {
    backgroundColor: '#F8FAFC',
    margin: 36,
    marginBottom: 20,
    borderRadius: 12,
    padding: 24,
    paddingBottom: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  brandText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleArea: {
    flexDirection: 'column',
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16A34A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  positionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'uppercase',
    lineHeight: 1.2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  funnelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  stageName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  secondaryFunnelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 150,
    paddingHorizontal: 36,
  },
  secondaryFunnelItem: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 100,
  },
  secondaryStageName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  secondaryStageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

const iconContainerStyle = {
  width: 22,
  height: 22,
  borderRadius: 6,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  marginRight: 12,
};

const SourcedIcon = () => (
  <View style={{...iconContainerStyle, backgroundColor: '#F1F5F9'}}>
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#64748B" strokeWidth={2} />
      <Path d="M8.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#64748B" strokeWidth={2} />
      <Path d="M20 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#64748B" strokeWidth={2} />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#64748B" strokeWidth={2} />
    </Svg>
  </View>
);

const ApproachedIcon = () => (
  <View style={{...iconContainerStyle, backgroundColor: '#EFF6FF'}}>
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#3B82F6" strokeWidth={2} />
      <Path d="M22 6l-10 7L2 6" stroke="#3B82F6" strokeWidth={2} />
    </Svg>
  </View>
);

const ActivePipelineIcon = () => (
    <View style={{...iconContainerStyle, backgroundColor: '#F5F3FF'}}>
        <Svg width="14" height="14" viewBox="0 0 24 24">
            <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#8B5CF6" strokeWidth="2" fill="none"/>
            <Path d="M14 2v6h6" stroke="#8B5CF6" strokeWidth="2"/>
            <Path d="M16 13H8" stroke="#8B5CF6" strokeWidth="2"/>
            <Path d="M16 17H8" stroke="#8B5CF6" strokeWidth="2"/>
            <Path d="M10 9H8" stroke="#8B5CF6" strokeWidth="2"/>
        </Svg>
    </View>
);

const ShortlistedIcon = () => (
  <View style={{...iconContainerStyle, backgroundColor: '#FAF5FF'}}>
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#A855F7" strokeWidth="2" />
      <Path d="M9 11l3 3L22 4" stroke="#A855F7" strokeWidth="2" fill="none"/>
    </Svg>
  </View>
);

const FinalInterviewsIcon = () => (
  <View style={{...iconContainerStyle, backgroundColor: '#F0FDF4'}}>
    <Svg width="14" height="14" viewBox="0 0 24 24">
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#22C55E" strokeWidth="2" />
      <Path d="M9 11l3 3L22 4" stroke="#22C55E" strokeWidth="2" fill="none"/>
    </Svg>
  </View>
);

const PdfLogo = () => (
    <View style={styles.logoBox}>
         <Text style={styles.logoLetter}>K</Text>
    </View>
);

const FunnelRow = ({ label, value, width, color, icon }: { label: string, value: number, width: string, color: string, icon: React.ReactNode }) => (
  <View style={[styles.funnelRow, { width, borderLeftColor: color, borderLeftWidth: 4 }]} wrap={false}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {icon}
        <Text style={styles.stageName}>{label}</Text>
    </View>
    <Text style={styles.stageValue}>{value}</Text>
  </View>
);

export const PositionReportDocument: React.FC<PositionReportData> = ({ clientName, positionTitle, reportDate, funnelMetrics, candidates }) => {
  const funnelData = [
    { label: "SOURCED", value: funnelMetrics.sourced, color: '#64748B', icon: <SourcedIcon /> },
    { label: "APPROACHED", value: funnelMetrics.approached, color: '#3B82F6', icon: <ApproachedIcon /> },
    { label: "ACTIVE PIPELINE", value: funnelMetrics.activePipeline, color: '#8B5CF6', icon: <ActivePipelineIcon /> },
    { label: "SHORTLISTED", value: funnelMetrics.shortlisted, color: '#A855F7', icon: <ShortlistedIcon /> },
    { label: "FINAL INTERVIEWS", value: funnelMetrics.finalInterviews, color: '#22C55E', icon: <FinalInterviewsIcon /> },
  ];

  const secondaryFunnelData = [
    { label: "NO RESPONSE", value: funnelMetrics.noResponse, color: '#F97316' },
    { label: "NOT INTERESTED", value: funnelMetrics.notInterested, color: '#EF4444' },
    { label: "REPROVED", value: 0, color: '#0F172A' },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}>
                <View style={styles.brandLeft}>
                <PdfLogo />
                <Text style={styles.brandText}>KAPTAS GLOBAL</Text>
                </View>
                <Text style={styles.dateText}>REPORT DATE: {reportDate}</Text>
            </View>
            <View style={styles.titleArea}>
                <Text style={styles.clientName}>{clientName}</Text>
                <Text style={styles.positionTitle}>{positionTitle}</Text>
            </View>
        </View>

        <Text style={styles.sectionTitle}>RECRUITMENT FUNNEL OVERVIEW</Text>

        <View style={styles.funnelContainer}>
          {funnelData.map((item, index) => (
            <FunnelRow 
              key={item.label} 
              label={item.label} 
              value={item.value} 
              width={`${78 - (index * 5)}%`} 
              color={item.color}
              icon={item.icon}
            />
          ))}
        </View>

        <View style={styles.secondaryFunnelContainer}>
          {secondaryFunnelData.map((item) => (
            <View key={item.label} style={[styles.secondaryFunnelItem, { borderLeftColor: item.color, borderLeftWidth: 3 }]}>
              <Text style={styles.secondaryStageName}>{item.label}</Text>
              <Text style={styles.secondaryStageValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
            <Text style={styles.footerText}>KAPTAS GLOBAL</Text>
            <Text style={styles.footerText}>CONFIDENTIAL</Text>
        </View>
      </Page>

      {candidates.map((candidate) => (
         <CandidateProfilePage key={candidate.id} {...candidate} />
      ))}
    </Document>
  );
};
