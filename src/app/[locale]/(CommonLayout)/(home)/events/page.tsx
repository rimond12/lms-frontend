"use client";
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Search, Filter, Clock, User, Star, ChevronDown, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGetItemsQuery } from '@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi';
import AppImage from '@/components/ui/AppImage';
import EventsBanner from '@/components/events/EventsBanner/EventsBanner';
import { ModernCard } from '@/components/events/ModernCard';

type Item = {
	_id: string;
	title: string;
	slug: string;
	content: string;
	photoUrl?: string;
	createdAt: string;
	eventDate?: string;
	organizerName?: string;
	speaker?: string;
	speakerDetails?: string;
	sponsorName?: string;
	sponsorTitle?: string;
	sponsorPhotoUrl?: string;
};

type SortOption = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc' | 'newest' | 'oldest';
type ViewMode = 'grid' | 'list';

// Helper function to strip HTML tags and convert to plain text
const stripHtmlTags = (html: string | null | undefined): string => {
	if (!html) return '';
	// Remove HTML tags and decode HTML entities
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent || div.innerText || '';
};

export default function EventsPage() {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedOrganizer, setSelectedOrganizer] = useState('');
	const [selectedSpeaker, setSelectedSpeaker] = useState('');
	const [dateFilter, setDateFilter] = useState('all');
	const [sortBy, setSortBy] = useState<SortOption>('newest');
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [showFilters, setShowFilters] = useState(false);

	// Use Redux to fetch events
	const { data: eventsData, isLoading: loading } = useGetItemsQuery({ category: 'event' });
	const items: Item[] = eventsData?.data || [];

	// Extract unique organizers and speakers for filter options
	const filterOptions = useMemo(() => {
		const organizers = [...new Set(items.map(item => item.organizerName).filter(Boolean))];
		const speakers = [...new Set(items.map(item => item.speaker).filter(Boolean))];
		return { organizers, speakers };
	}, [items]);

	// Filter and sort items
	const filteredAndSortedItems = useMemo(() => {
		let filtered = items.filter(item => {
			const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(item.organizerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.speaker?.toLowerCase().includes(searchTerm.toLowerCase()));

			const matchesOrganizer = !selectedOrganizer || item.organizerName === selectedOrganizer;
			const matchesSpeaker = !selectedSpeaker || item.speaker === selectedSpeaker;

			const matchesDate = dateFilter === 'all' || (() => {
				const eventDate = new Date(item.eventDate || item.createdAt);
				const now = new Date();
				const oneWeek = 7 * 24 * 60 * 60 * 1000;
				const oneMonth = 30 * 24 * 60 * 60 * 1000;

				switch (dateFilter) {
					case 'upcoming':
						return eventDate > now;
					case 'past':
						return eventDate < now;
					case 'this-week':
						return Math.abs(eventDate.getTime() - now.getTime()) < oneWeek;
					case 'this-month':
						return Math.abs(eventDate.getTime() - now.getTime()) < oneMonth;
					default:
						return true;
				}
			})();

			return matchesSearch && matchesOrganizer && matchesSpeaker && matchesDate;
		});

		// Sort items
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'date-asc':
					return new Date(a.eventDate || a.createdAt).getTime() - new Date(b.eventDate || b.createdAt).getTime();
				case 'date-desc':
					return new Date(b.eventDate || b.createdAt).getTime() - new Date(a.eventDate || a.createdAt).getTime();
				case 'title-asc':
					return a.title.localeCompare(b.title);
				case 'title-desc':
					return b.title.localeCompare(a.title);
				case 'newest':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case 'oldest':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				default:
					return 0;
			}
		});

		return filtered;
	}, [items, searchTerm, selectedOrganizer, selectedSpeaker, dateFilter, sortBy]);

	const EventCard = ({ item, index }: { item: Item; index: number }) => (
		<Link href={`/events/${item.slug}`}>
			<ModernCard
				imageUrl={item.photoUrl || 'https://placehold.co/600x400/cccccc/ffffff?text=No+Image'}
				title={item.title}
				author={item.speaker || item.organizerName || 'Unknown'}
				description={stripHtmlTags(item.content)}
			/>
		</Link>
	);




	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
			{/* Professional Events Hero Section */}
			<EventsBanner />

			<div className="max-w-5xl mx-auto px-6 py-10">
				{/* Search and Filter Section */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 animate-slide-down">
					<div className="flex flex-col lg:flex-row gap-4 items-center">
						{/* Search Bar */}
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								type="text"
								placeholder="Search events, speakers, organizers..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10 h-10 border-2 border-gray-200 focus:border-[#B34644] rounded-lg text-sm"
							/>
						</div>

						{/* Filter Toggle */}
						<Button
							onClick={() => setShowFilters(!showFilters)}
							variant="outline"
							className="flex items-center gap-2 h-10 px-4 border-2 border-[#B34644] text-[#B34644] hover:bg-[#B34644] hover:text-white rounded-lg text-sm"
						>
							<Filter className="w-4 h-4" />
							<span>Filters</span>
							<ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
						</Button>

						{/* View Mode Toggle */}
						<div className="flex bg-gray-100 rounded-lg p-1">
							<Button
								onClick={() => setViewMode('grid')}
								variant={viewMode === 'grid' ? 'default' : 'ghost'}
								size="sm"
								className="rounded-md"
							>
								<Grid className="w-3 h-3" />
							</Button>
							<Button
								onClick={() => setViewMode('list')}
								variant={viewMode === 'list' ? 'default' : 'ghost'}
								size="sm"
								className="rounded-md"
							>
								<List className="w-3 h-3" />
							</Button>
						</div>
					</div>

					{/* Advanced Filters */}
					{showFilters && (
						<div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg animate-slide-down">
							{/* Organizer Filter */}
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Organizer</label>
								<select
									value={selectedOrganizer}
									onChange={(e) => setSelectedOrganizer(e.target.value)}
									className="w-full h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
								>
									<option value="">All Organizers</option>
									{filterOptions.organizers.map(organizer => (
										<option key={organizer} value={organizer}>{organizer}</option>
									))}
								</select>
							</div>

							{/* Speaker Filter */}
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Speaker</label>
								<select
									value={selectedSpeaker}
									onChange={(e) => setSelectedSpeaker(e.target.value)}
									className="w-full h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
								>
									<option value="">All Speakers</option>
									{filterOptions.speakers.map(speaker => (
										<option key={speaker} value={speaker}>{speaker}</option>
									))}
								</select>
							</div>

							{/* Date Filter */}
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
								<select
									value={dateFilter}
									onChange={(e) => setDateFilter(e.target.value)}
									className="w-full h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
								>
									<option value="all">All Dates</option>
									<option value="upcoming">Upcoming</option>
									<option value="past">Past Events</option>
									<option value="this-week">This Week</option>
									<option value="this-month">This Month</option>
								</select>
							</div>

							{/* Sort Filter */}
							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as SortOption)}
									className="w-full h-8 px-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
								>
									<option value="newest">Newest First</option>
									<option value="oldest">Oldest First</option>
									<option value="date-asc">Event Date (Earliest)</option>
									<option value="date-desc">Event Date (Latest)</option>
									<option value="title-asc">Title (A-Z)</option>
									<option value="title-desc">Title (Z-A)</option>
								</select>
							</div>
						</div>
					)}
				</div>

				{/* Results Summary */}
				<div className="flex items-center justify-between mb-6">
					<div className="text-sm text-gray-600">
						<span className="font-semibold text-[#B34644]">{filteredAndSortedItems.length}</span> events found
						{searchTerm && <span className="ml-2">for "{searchTerm}"</span>}
					</div>
					{(searchTerm || selectedOrganizer || selectedSpeaker || dateFilter !== 'all') && (
						<Button
							onClick={() => {
								setSearchTerm('');
								setSelectedOrganizer('');
								setSelectedSpeaker('');
								setDateFilter('all');
							}}
							variant="outline"
							size="sm"
							className="text-[#B34644] border-[#B34644] hover:bg-[#B34644] hover:text-white text-xs"
						>
							Clear Filters
						</Button>
					)}
				</div>

				{/* Events Grid/List */}
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<div className="animate-spin rounded-full h-12 w-12 border-4 border-[#B34644] border-t-transparent"></div>
					</div>
				) : filteredAndSortedItems.length === 0 ? (
					<div className="text-center py-16">
						<div className="max-w-sm mx-auto">
							<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Calendar className="w-10 h-10 text-gray-400" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
							<p className="text-sm text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
							<Button
								onClick={() => {
									setSearchTerm('');
									setSelectedOrganizer('');
									setSelectedSpeaker('');
									setDateFilter('all');
								}}
								className="bg-[#B34644] hover:bg-[#8B1E1E] text-sm"
							>
								View All Events
							</Button>
						</div>
					</div>
				) : (
					<div className={`grid gap-6 ${
						viewMode === 'grid'
							? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
							: 'grid-cols-1'
					}`}>
						{filteredAndSortedItems.map((item, index) => (
							<EventCard key={item._id} item={item} index={index} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
