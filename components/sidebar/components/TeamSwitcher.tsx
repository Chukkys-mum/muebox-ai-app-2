import React, { useEffect, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';

interface TeamSwitcherProps {
  onClose: () => void;
}

interface Team {
  id: string;
  name: string;
  members: number;
}

const TeamSwitcher = ({ onClose }: TeamSwitcherProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const fetchTeams = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        const { data: teamsData } = await supabase
          .from('teams')
          .select(`
            team_id,
            users!inner (
              full_name,
              id
            )
          `)
          .eq('user_id', userData.user.id);

        if (teamsData) {
        const formattedTeams: Team[] = teamsData.map((team: any) => ({
            id: team.team_id,
            name: team.users?.[0]?.full_name || 'Name',
            members: team.users?.length || 0
          }));
          setTeams(formattedTeams);
        }
      }
    };

    fetchTeams();
  }, []);

  const handleTeamSelect = (teamId: string) => {
    router.push('/dashboard/main');
    onClose();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="w-[800px] h-[400px] bg-white rounded-xl shadow-lg relative overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-50"
        >
          <X size={20} />
        </button>

        {/* Top gradient shape */}
        <div className="absolute -left-4 -top-4">
          <div className="w-40 h-40 bg-gradient-to-br from-pink-200 to-blue-500 rounded-br-3xl transform rotate-12" />
        </div>

        <div className="relative z-10 p-10">
          <div className="text-center mb-6">
            <h2 className="text-blue-950 text-2xl font-bold tracking-wide">Choose a Team</h2>
            <div className="w-full h-px bg-rose-400 mt-2" />
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-blue-950 mb-2">
              So much, <span className="text-rose-400">Choice!</span>
            </h1>
            <p className="text-sky-800/70 text-lg">Select a team to get started.</p>
          </div>

          <div className="space-y-4 max-h-[200px] overflow-y-auto pr-4">
            {teams.map((team) => (
              <button 
                key={team.id}
                onClick={() => handleTeamSelect(team.id)}
                className="w-full h-16 bg-white rounded border border-slate-300/70 hover:border-rose-400 p-4 flex items-center space-x-4 cursor-pointer group"
              >
                <Lock className="w-6 h-6 text-slate-300 group-hover:text-rose-400" />
                <div className="flex-grow text-left">
                  <p className="text-blue-950 text-xl font-semibold">{team.name}</p>
                  <p className="text-slate-300 text-sm">{team.members} team mates</p>
                </div>
                <div className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl">
                  ›
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-sky-800/70 mt-6">
            If you need help <span className="text-rose-400 cursor-pointer">click here</span>.
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 right-0">
          <div className="w-32 h-32">
            <div className="w-full h-full border-2 border-pink-100 rounded-full opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSwitcher;