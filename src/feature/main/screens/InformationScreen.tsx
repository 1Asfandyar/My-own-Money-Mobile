import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useCallback } from 'react';
import {
    Alert,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    View,
} from 'react-native';

import { ENV } from '@/config/env';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

type LegalDocumentLink = {
	description: string;
	label: string;
	required: boolean;
	url: string | null;
};

const LEGAL_DOCUMENT_LINKS: LegalDocumentLink[] = [
	{
		description:
			'Required store disclosure snippets for Google Play and Apple App Store listing pages.',
		label: 'App Store Policy Snippets (Play Store + App Store)',
		required: true,
		url: ENV.LEGAL_APP_STORE_POLICY_SNIPPETS_URL,
	},
	{
		description:
			'Summary statement for cyber liability coverage, incident response process, and policy roadmap.',
		label: 'Cyber Liability Insurance Statement and Roadmap',
		required: false,
		url: ENV.LEGAL_CYBER_LIABILITY_STATEMENT_URL,
	},
	{
		description:
			'Controller notice for partners and service providers processing user data.',
		label: 'Data Processing Addendum (Controller Notice)',
		required: true,
		url: ENV.LEGAL_DATA_PROCESSING_ADDENDUM_URL,
	},
	{
		description: 'How personal data is collected, used, retained, and deleted.',
		label: 'Privacy Policy',
		required: true,
		url: ENV.LEGAL_PRIVACY_POLICY_URL,
	},
	{
		description: 'User rights, prohibited use, dispute terms, and account obligations.',
		label: 'Terms of Service',
		required: true,
		url: ENV.LEGAL_TERMS_OF_SERVICE_URL,
	},
	{
		description:
			'Required by many app stores when users can submit deletion requests from inside the app.',
		label: 'Account Deletion Policy',
		required: true,
		url: ENV.LEGAL_ACCOUNT_DELETION_POLICY_URL,
	},
	{
		description:
			'Optional legal notice to communicate cookie and SDK tracking behavior clearly.',
		label: 'Cookie and Tracking Technologies Notice',
		required: false,
		url: ENV.LEGAL_COOKIE_TRACKING_NOTICE_URL,
	},
];

const InformationScreen = () => {
	const appVersion = Constants.expoConfig?.version ?? 'Not available';
	const appName = ENV.APP_NAME;
	const appScheme = Constants.expoConfig?.scheme ?? 'Not available';
	const appId =
		Platform.OS === 'android'
			? Constants.expoConfig?.android?.package
			: Constants.expoConfig?.ios?.bundleIdentifier;

	const appInfo = [
		{ label: 'App name', value: appName },
		{ label: 'Version', value: appVersion },
		{ label: 'Platform', value: Platform.OS },
		{ label: 'App identifier', value: appId ?? 'Not available' },
		{ label: 'Deep link scheme', value: appScheme },
	];

	const openDocument = useCallback(async (label: string, url: string | null) => {
		if (!url) {
			Alert.alert('Coming soon', `${label} link has not been configured yet.`);
			return;
		}

		const canOpen = await Linking.canOpenURL(url);
		if (!canOpen) {
			Alert.alert('Unavailable link', 'This document link is not reachable right now.');
			return;
		}

		await Linking.openURL(url);
	}, []);

	return (
		<ScrollView className="flex-1 bg-white" contentContainerClassName="px-5 pb-10 pt-6">
			<ThemedText className="text-2xl text-gray-900" weight="bold">
				Information
			</ThemedText>
			<ThemedText className="mt-2 text-sm leading-6 text-gray-500">
				Find app details and legal documentation references here.
			</ThemedText>

			<View className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
				<ThemedText className="text-xs uppercase tracking-wide text-gray-400">
					App details
				</ThemedText>
				{appInfo.map((item) => (
					<View
						key={item.label}
						className="mt-3 flex-row items-start justify-between border-b border-gray-200 pb-3"
					>
						<ThemedText className="mr-4 flex-1 text-sm text-gray-600">
							{item.label}
						</ThemedText>
						<ThemedText className="max-w-[62%] text-right text-sm text-gray-900" weight="semiBold">
							{item.value}
						</ThemedText>
					</View>
				))}
			</View>

			<View className="mt-6">
				<ThemedText className="text-xs uppercase tracking-wide text-gray-400">
					Legal and compliance
				</ThemedText>

				{LEGAL_DOCUMENT_LINKS.map((doc) => (
					<Pressable
						key={doc.label}
						accessibilityRole="button"
						accessibilityLabel={doc.label}
						onPress={() => {
							void openDocument(doc.label, doc.url);
						}}
						className="mt-3 rounded-2xl border border-gray-100 bg-white px-4 py-4"
					>
						<View className="flex-row items-start justify-between">
							<View className="min-w-0 flex-1 pr-4">
								<ThemedText className="text-sm text-gray-900" weight="semiBold">
									{doc.label}
								</ThemedText>
								<ThemedText className="mt-1 text-xs leading-5 text-gray-500">
									{doc.description}
								</ThemedText>
								<ThemedText className="mt-2 text-[11px] uppercase tracking-wide text-gray-400">
									{doc.required ? 'Required for production' : 'Optional'}
								</ThemedText>
							</View>

							<Ionicons
								name={doc.url ? 'open-outline' : 'time-outline'}
								size={18}
								color={doc.url ? themeColors.primary : themeColors.gray400}
							/>
						</View>
					</Pressable>
				))}
			</View>
		</ScrollView>
	);
};

export default InformationScreen;
