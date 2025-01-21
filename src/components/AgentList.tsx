import { useState, useEffect, useMemo } from 'react';
import { SendSolButton } from './WalletComponent';
import { getBalance } from './WalletComponent';
import type { GameId } from '../../convex/aiTown/ids';
import closeImg from '../../assets/close.svg';

interface Agent {
  name: string;
  address: string;
  id: GameId<'players'>;
}

const agents: Agent[] = [
  {
    name: 'Lambo',
    address: 'EiC9h9YLEGTdsU2GNcgPeNnpB9HwrQU8u9o4oY3LwrWd',
    id: 'p:6' as GameId<'players'>,
  },
  {
    name: 'Triamph',
    address: '5zpGkyMgSuTh359RArWmB4y1cbhS33ZqRk8GQuLK5Uxy',
    id: 'p:2' as GameId<'players'>,
  },
  {
    name: 'Edison',
    address: 'ASa2SCBd4MVFqetY9XTX2f1ddp2tK2K88CNWqCnaoznw',
    id: 'p:4' as GameId<'players'>,
  },
  {
    name: 'Stella',
    address: 'H2PxCyH2PbMP2xBhut5qDrr8TwGztt1NdaPzBw1KZj3u',
    id: 'p:0' as GameId<'players'>,
  },
  {
    name: 'Alice',
    address: 'HPXvdSLmfyaMokvpk5562AP1yw4aVtzaAKJF82X1m21N',
    id: 'p:8' as GameId<'players'>,
  },
  {
    name: 'Kira',
    address: '7KrDaA4HaFkSAgBrPVuXcJsgdTETXc8qqSQsmpajHNCU',
    id: 'p:10' as GameId<'players'>,
  },
];

interface AgentListProps {
  setSelectedElement: (element: { kind: 'player'; id: GameId<'players'> }) => void;
}

export default function AgentList({ setSelectedElement }: AgentListProps) {
  const [balances, setBalances] = useState<{ [key: string]: number | null }>({});

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

  return (
    <>
      <div className="flex justify-between">
        <div className="hidden lg:block w-full lg:text-center text-2xl lg:text-5xl font-bold font-display shadow-solid box">
          <p className="bg-[#964253] p-1">Artificial Isle</p>
        </div>
      </div>

      <div className="lg:mt-4 chats text-black">
        <div className="bg-[#ffe478] p-2">
          <div className="flex justify-between items-center">
            <p className="text-lg">Agents in-play:</p>
            <h2 className="font-display shadow-solid text-2xl">Week 1</h2>
          </div>

          <div className="mt-2 bg-black w-full h-[1px]" />
          <div className="bubble-notip">
            <ol className="flex flex-col gap-4 bg-white">
              {sortedAgents.map((agent) => (
                <li key={agent.name} className="flex justify-between items-center ">
                  <p
                    onClick={() => setSelectedElement({ kind: 'player', id: agent.id })}
                    className="cursor-pointer hover:underline py-2 underline underline-offset-2"
                  >
                    {agent.name}
                  </p>
                  <SendSolButton recipientAddress={agent.address} />
                  <div className="flex items-center">
                    <img
                      className="mr-1"
                      src="/assets/solanalogo.png"
                      width="20"
                      height="20"
                      alt="SOL"
                    />
                    {balances[agent.name] !== undefined ? (
                      <p>{balances[agent.name]?.toFixed(3) ?? 'Error'}</p>
                    ) : (
                      <div className="w-5 h-5 mx-auto border-4 border-t-yellow-500 border-yellow-200 rounded-full animate-spin"></div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
