import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link, Font } from '@react-pdf/renderer';
import { CandidateProfilePdfProps } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 20,
  },
  headerText: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  logo: {
    width: 120,
    height: 30,
  },
  main: {
    flexDirection: 'row',
    flexGrow: 1,
  },
  leftColumn: {
    width: '35%',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  rightColumn: {
    width: '65%',
    paddingLeft: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 10,
    marginLeft: 6,
    color: '#374151',
    textDecoration: 'none',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  skillBadge: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 9,
    marginRight: 6,
    marginBottom: 6,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

export const CandidateProfileDocument: React.FC<CandidateProfilePdfProps> = ({ candidate }) => {
    const {
        name,
        title,
        location,
        email,
        phone,
        linkedin,
        skills,
        languages,
        summary,
        professionalBackground,
        compensation,
        projectRole,
    } = candidate;

    const formattedCompensation = compensation ? formatCurrency(parseFloat(compensation)) : 'N/A';
    const skillsList = skills || [];
    const languagesList = languages || [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerText}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.title}>{title || 'N/A'}</Text>
                        <Text style={styles.location}>{location || 'N/A'}</Text>
                    </View>
                    {/* The logo is now text-based to avoid image loading issues */}
                    <Text>TalentFlow</Text>
                </View>

                {/* Main Content */}
                <View style={styles.main}>
                    {/* Left Column */}
                    <View style={styles.leftColumn}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contact</Text>
                            {email && (
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactText}>{email}</Text>
                                </View>
                            )}
                            {phone && (
                                <View style={styles.contactInfo}>
                                    <Text style={styles.contactText}>{phone}</Text>
                                </View>
                            )}
                            {linkedin && (
                                <Link src={linkedin} style={styles.contactInfo}>
                                    <Text style={styles.contactText}>LinkedIn</Text>
                                </Link>
                            )}
                        </View>

                        {skillsList.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Skills</Text>
                                <View style={styles.skillsContainer}>
                                    {skillsList.map((skill, index) => (
                                        <Text key={index} style={styles.skillBadge}>{skill}</Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {languagesList.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Languages</Text>
                                <View style={styles.skillsContainer}>
                                    {languagesList.map((lang, index) => (
                                        <Text key={index} style={styles.skillBadge}>{lang}</Text>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Right Column */}
                    <View style={styles.rightColumn}>
                        {summary && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Summary</Text>
                                <Text style={styles.text}>{summary}</Text>
                            </View>
                        )}

                        {professionalBackground && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Professional Background</Text>
                                <Text style={styles.text}>{professionalBackground}</Text>
                            </View>
                        )}

                        <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
                            <View style={[styles.section, {width: '48%'}]}>
                                <Text style={styles.sectionTitle}>Role</Text>
                                <Text style={styles.text}>{projectRole || 'N/A'}</Text>
                            </View>

                            <View style={[styles.section, {width: '48%'}]}>
                                <Text style={styles.sectionTitle}>Compensation</Text>
                                <Text style={styles.text}>{formattedCompensation}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => pageNumber + ' / ' + totalPages}
                    fixed
                />
            </Page>
        </Document>
      );
    };
