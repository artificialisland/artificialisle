import { useState, useEffect, useMemo } from 'react';
import { SendSolButton } from './WalletComponent';
import { getBalance } from './WalletComponent';
import type { GameId } from '../../convex/aiTown/ids';
import { VoteModal } from './VoteModal';
import { WeekCountdown } from './WeekCountdown';

interface Agent {
  name: string;
  address: string;
  id: GameId<'players'>;
}

const agents: Agent[] = [
  {
    name: 'Alice',
    address: 'EiC9h9YLEGTdsU2GNcgPeNnpB9HwrQU8u9o4oY3LwrWd',
    id: 'p:8' as GameId<'players'>,
  },
  {
    name: 'Triumph',
    address: '5zpGkyMgSuTh359RArWmB4y1cbhS33ZqRk8GQuLK5Uxy',
    id: 'p:2' as GameId<'players'>,
  },

  {
    name: 'Edison',
    address: 'ASa2SCBd4MVFqetY9XTX2f1ddp2tK2K88CNWqCnaoznw',
    id: 'p:4' as GameId<'players'>,
  },
  {
    name: 'Kurama',
    address: '9F1aFaP9uKEisJ4RtVDx49S7Uhs6BaXxq2cJymNoApLR',
    id: 'p:0' as GameId<'players'>,
  },
  {
    name: 'Lambo',
    address: '9s9k5X7EVkRtKE6PYzDVd9aU9qGFy5dHyiRya7sjCUxK',
    id: 'p:6' as GameId<'players'>,
  },
  /*   {
    name: 'Dave',
    address: '3F6L4ArRJEbij8MPim1yqR9z7Fvg4KcftSpgb97iGXna',
    id: 'p:10' as GameId<'players'>,
  }, */
];

interface AgentListProps {
  setSelectedElement: (element: { kind: 'player'; id: GameId<'players'> }) => void;
}

export default function AgentList({ setSelectedElement }: AgentListProps) {
  const [balances, setBalances] = useState<{ [key: string]: number | null }>({});
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      const newBalances: { [key: string]: number | null } = {};
      for (const agent of agents) {
        try {
          const balance = await getBalance(agent.address);
          newBalances[agent.name] = balance;
        } catch (error) {
          console.error(`Error fetching balance for ${agent.name}:`, error);
          newBalances[agent.name] = null;
        }
      }
      setBalances(newBalances);
    };

    fetchBalances();
  }, []);

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      const balanceA = balances[a.name] ?? -1;
      const balanceB = balances[b.name] ?? -1;
      return balanceB - balanceA;
    });
  }, [balances]);

  const openVoteModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsVoteModalOpen(true);
  };

  const closeVoteModal = () => {
    setIsVoteModalOpen(false);
    setSelectedAgent(null);
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="hidden lg:block w-full lg:text-center text-2xl lg:text-5xl font-bold font-display shadow-solid box">
          <p className="bg-[#964253] p-1 flex flex-col items-center">
            <span>Artificial</span>
            <span className="flex items-center">
              Isle
              <img
                src="/assets/pixelislandicon.png"
                alt="Island Icon"
                className="ml-4 -mt-1 h-8 w-8"
              />
            </span>
          </p>
        </div>
      </div>

      <div className="lg:mt-4 chats text-black">
        <div className="bg-[#ffe478] p-2">
          <div className="flex justify-between items-center">
            <h2 className="font-display shadow-solid text-2xl">SEASON 1 IS OVER</h2>
            <WeekCountdown />
          </div>
          <div className="mt-2 bg-black w-full h-[1px]" />
          {/*  <div className="bubble-notip">
            <ol className="flex flex-col gap-4 bg-white">
              {sortedAgents.map((agent) => (
                <li key={agent.name} className="flex justify-between items-center ">
                  <p
                    onClick={() => setSelectedElement({ kind: 'player', id: agent.id })}
                    className="cursor-pointer hover:underline py-2 underline underline-offset-2"
                  >
                    {agent.name}
                  </p>
                  <button
                    className="flex justify-center button text-xs bg-clay-700 text-white rounded-xl pointer-events-auto"
                    onClick={() => openVoteModal(agent)}
                  >
                    Vote
                  </button>

                  <div className="flex items-center">
                    <img
                      className="mr-1"
                      src="/assets/clam.svg"
                      width="20"
                      height="20"
                      alt="CLAM"
                    />
                    {balances[agent.name] !== undefined ? (
                      <p>{balances[agent.name]?.toFixed(0) ?? 'Error'}</p>
                    ) : (
                      <div className="w-5 h-5 mx-auto border-4 border-t-yellow-500 border-yellow-200 rounded-full animate-spin"></div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div> */}
          <p className="mt-2 font-bold text-lg">Game is now paused.</p>
          We are currently working on Season 2 and a better way to monetize in order to pay running
          costs.
        </div>
      </div>

      <VoteModal isOpen={isVoteModalOpen} onClose={closeVoteModal} agent={selectedAgent} />
    </>
  );
}
