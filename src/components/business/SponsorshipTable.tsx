import { useState } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessSponsorships } from '@/hooks/useBusinessSponsorships';
import { useToast } from '@/hooks/use-toast';
import type { BusinessSponsorship } from '@/types/dashboard';

export function SponsorshipTable() {
  const [sortBy, setSortBy] = useState('team');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: sponsorships = [], isLoading, error } = useBusinessSponsorships();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Activation':
        return 'bg-[#ffb82d]/20 text-[#ffb82d]';
      case 'Inactive':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleEdit = (sponsorship: BusinessSponsorship) => {
    toast({
      title: "Coming Soon",
      description: "Sponsorship editing will be available soon.",
    });
  };

  // Filter sponsorships
  const filteredSponsorships = sponsorships.filter(sponsorship => 
    filterStatus === 'all' || sponsorship.status.toLowerCase() === filterStatus
  );

  // Sort sponsorships
  const sortedSponsorships = [...filteredSponsorships].sort((a, b) => {
    switch (sortBy) {
      case 'team':
        return a.team.localeCompare(b.team);
      case 'amount':
        return parseInt(b.amount.replace(/[$,]/g, '')) - parseInt(a.amount.replace(/[$,]/g, ''));
      case 'exposure':
        return parseInt(b.exposure.replace('K', '000')) - parseInt(a.exposure.replace('K', '000'));
      case 'conversions':
        return b.conversions - a.conversions;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="text-center text-gray-500">Loading sponsorships...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="text-center text-red-500">Error loading sponsorships</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          {/* Title Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 inline">
              Active Sponsorships
            </h3>
            <span className="ml-3 text-sm text-gray-600">
              • Manage and track your current sponsorship partnerships
            </span>
          </div>

          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="activation">Activation</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="exposure">Exposure</SelectItem>
                <SelectItem value="conversions">Conversions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        {sortedSponsorships.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">No sponsorships found</p>
            <p className="text-gray-400 text-sm">
              {filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Browse the marketplace to find sponsorship opportunities'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#545454]">Team</TableHead>
                <TableHead className="text-[#545454]">Status</TableHead>
                <TableHead className="text-[#545454]">Type</TableHead>
                <TableHead className="text-[#545454]">Location</TableHead>
                <TableHead className="text-[#545454]">Amount</TableHead>
                <TableHead className="text-[#545454]">Exposure</TableHead>
                <TableHead className="text-[#545454]">Clicks</TableHead>
                <TableHead className="text-[#545454]">Conversions</TableHead>
                <TableHead className="text-[#545454]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSponsorships.map((sponsorship) => (
                <TableRow key={sponsorship.id}>
                  {/* Team Column */}
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#00aafe]/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#00aafe]">
                          {sponsorship.team.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{sponsorship.team}</div>
                        <div className="text-sm text-gray-500">{sponsorship.sport}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell className="py-4 px-4">
                    <Badge className={getStatusColor(sponsorship.status)}>
                      {sponsorship.status}
                    </Badge>
                  </TableCell>

                  {/* Type Column */}
                  <TableCell className="py-4 px-4 text-[#545454]">
                    {sponsorship.teamType}
                  </TableCell>

                  {/* Location Column */}
                  <TableCell className="py-4 px-4 text-[#545454]">
                    {sponsorship.location}
                  </TableCell>

                  {/* Amount Column */}
                  <TableCell className="py-4 px-4 text-[#545454] font-medium">
                    {sponsorship.amount}
                  </TableCell>

                  {/* Exposure Column */}
                  <TableCell className="py-4 px-4 text-[#545454]">
                    {sponsorship.exposure}
                  </TableCell>

                  {/* Clicks Column */}
                  <TableCell className="py-4 px-4 text-[#545454]">
                    {sponsorship.clicks}
                  </TableCell>

                  {/* Conversions Column */}
                  <TableCell className="py-4 px-4 text-[#545454] font-medium">
                    {sponsorship.conversions}
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell className="py-4 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-gray-100"
                      onClick={() => handleEdit(sponsorship)}
                    >
                      <Edit className="w-4 h-4 text-[#545454] hover:text-[#00aafe]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
