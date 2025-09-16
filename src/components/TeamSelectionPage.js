/* TeamSelectionPage.js - Enhanced team selection with optional team member filtering
 * UI Changes: Added toggleable flag for including team members in filtered lists, improved responsive layout
 */
import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, Container, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { FilterList } from '@mui/icons-material';
import FilterSection from './FilterSection';
import ServantSelection from './ServantSelection';
import TeamSection from './TeamSection';
import CommonServantsGrid from './CommonServantsGrid';
import SimpleMysticCodeSelection from './SimpleMysticCodeSelection';
import { useNavigate } from 'react-router-dom';
import '../TeamSelectionPage.css';
import '../ui-vars.css';

const TeamSelectionPage = ({ team, setTeam, servants, filteredServants, setFilteredServants, handleServantClick, handleTeamServantClick, updateServantEffects, clearTeam, sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedRarity, setSelectedRarity, selectedClass, setSelectedClass, selectedNpType, setSelectedNpType, selectedAttackType, setSelectedAttackType, capitalize, handleCheckboxChange, attackTypeLabels, selectedMysticCode, setSelectedMysticCode}) => {
  const navigate = useNavigate();
  const [includeTeamMembers, setIncludeTeamMembers] = useState(false);

  const handleGotoQuest = () => {
    navigate('/quest-selection');
  };

  const handleGotoSearch = () => {
    navigate('/search');
  };

  useEffect(() => {
    const filterServants = () => {
      let filtered = servants;

      if (selectedRarity.length > 0) {
        filtered = filtered.filter(servant => selectedRarity.includes(servant.rarity.toString()));
      }
      if (selectedClass.length > 0) {
        filtered = filtered.filter(servant => selectedClass.includes(servant.className.toLowerCase()));
      }
      if (selectedNpType.length > 0) {
        filtered = filtered.filter(servant =>
          servant.noblePhantasms &&
          servant.noblePhantasms.some(np => selectedNpType.includes(np.card.toLowerCase()))
        );
      }
      if (selectedAttackType.length > 0) {
        filtered = filtered.filter(servant =>
          servant.noblePhantasms &&
          servant.noblePhantasms.some(np =>
            np.effectFlags &&
            np.effectFlags.some(flag => selectedAttackType.includes(flag))
          )
        );
      }
      if (searchQuery) {
        filtered = filtered.filter(servant => servant.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      if (sortOrder) {
        filtered = filtered.sort((a, b) => a[sortOrder].localeCompare(b[sortOrder]));
      }

      // Optional: include team members in filtered list
      // This is now explicitly controlled by the includeTeamMembers toggle
      if (includeTeamMembers) {
        const teamMembers = servants.filter(servant => 
          team.some(teamMember => teamMember.collectionNo === servant.collectionNo)
        );
        // Merge team members with filtered results, avoiding duplicates
        const uniqueServants = new Map();
        [...filtered, ...teamMembers].forEach(servant => {
          uniqueServants.set(servant.collectionNo, servant);
        });
        filtered = Array.from(uniqueServants.values());
      }

      setFilteredServants(filtered);
    };

    filterServants();
  }, [selectedRarity, selectedClass, selectedNpType, selectedAttackType, searchQuery, sortOrder, servants, team, setFilteredServants, includeTeamMembers]);

  return (
    <Container className="team-selection-container">
      <Typography variant="h4" className="fgo-font-bold" sx={{ mb: 3 }}>
        Select Your Team
      </Typography>
      
      {/* Filter Controls Header */}
      <Box className="filter-controls-header" sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        p: 2,
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--border-radius-md)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <Box className="fgo-flex" sx={{ alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          <Typography variant="h6" className="fgo-font-medium">
            Filters
          </Typography>
        </Box>
        <Tooltip title="When enabled, team members will always appear in search results regardless of active filters">
          <FormControlLabel
            control={
              <Switch
                checked={includeTeamMembers}
                onChange={(e) => setIncludeTeamMembers(e.target.checked)}
                size="small"
              />
            }
            label="Include Team in Results"
            sx={{ mr: 0 }}
          />
        </Tooltip>
      </Box>

      {/* Main Content Grid */}
      <Box className="filter-common-servants fgo-grid" sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '300px 200px 1fr' },
        gap: 2,
        minHeight: '42.5rem',
        mb: 3
      }}>
        {/* Filter Section */}
        <Box className="filter-section fgo-card">
          <FilterSection
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedRarity={selectedRarity}
            setSelectedRarity={setSelectedRarity}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedNpType={selectedNpType}
            setSelectedNpType={setSelectedNpType}
            selectedAttackType={selectedAttackType}
            setSelectedAttackType={setSelectedAttackType}
            capitalize={capitalize}
            handleCheckboxChange={handleCheckboxChange}
            attackTypeLabels={attackTypeLabels}
          />
        </Box>

        {/* Common Servants Grid */}
        <Box className="common-servants-grid fgo-card">
          <Typography variant="h6" className="fgo-font-medium" sx={{ mb: 2 }}>
            Common Servants
          </Typography>
          <CommonServantsGrid
            handleServantClick={handleServantClick}
          />
        </Box>

        {/* Servant Selection */}
        <Box className="servant-selection fgo-card">
          <Typography variant="h6" className="fgo-font-medium" sx={{ mb: 2 }}>
            Servant Selection
            {includeTeamMembers && (
              <Typography variant="caption" sx={{ ml: 1, fontStyle: 'italic' }}>
                (includes team members)
              </Typography>
            )}
          </Typography>
          <ServantSelection
            servants={filteredServants}
            handleServantClick={handleServantClick}
          />
        </Box>
      </Box>

      {/* Clear Team Button */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={clearTeam}
          className="fgo-button"
        >
          Clear Team
        </Button>
      </Box>

      {/* Team and Mystic Code Section */}
      <Box className="team-mystic-code fgo-grid" sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 3,
        mb: 3
      }}>
        <Box className="team-section">
          <TeamSection
            team={team}
            servants={servants}
            activeServant={null}
            handleTeamServantClick={handleTeamServantClick}
            updateServantEffects={updateServantEffects}
            pageType="team-selection-page"
          />
        </Box>
        <Box className="mystic-code-selection">
          <SimpleMysticCodeSelection
            selectedMysticCode={selectedMysticCode}
            setSelectedMysticCode={setSelectedMysticCode}
          />
        </Box>
      </Box>

      {/* Navigation Buttons */}
      <Box className="team-selection-buttons" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleGotoQuest}
          className="fgo-button"
        >
          GOTO Quests
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleGotoSearch}
          className="fgo-button"
        >
          GOTO Search
        </Button>
      </Box>
    </Container>
  );
};

export default TeamSelectionPage;