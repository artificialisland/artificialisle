import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import closeImg from '../../assets/close.svg';
import { SelectElement } from './Player';
import { Messages } from './Messages';
import { toastOnError } from '../toasts';
import { useSendInput } from '../hooks/sendInput';
import { Player } from '../../convex/aiTown/player';
import { GameId } from '../../convex/aiTown/ids';
import { ServerGame } from '../hooks/serverGame';
import { getBalance, SendSolButton } from './WalletComponent';
import AgentList from './AgentList';
import { useEffect, useState } from 'react';
import { ShareableCard } from './ShareableCard';
import { useWallet } from '@jup-ag/wallet-adapter';

export default function PlayerDetails({
  worldId,
  engineId,
  game,
  playerId,
  setSelectedElement,
  scrollViewRef,
}: {
  worldId: Id<'worlds'>;
  engineId: Id<'engines'>;
  game: ServerGame;
  playerId?: GameId<'players'>;
  setSelectedElement: SelectElement;
  scrollViewRef: React.RefObject<HTMLDivElement>;
}) {
  const { publicKey } = useWallet();
  const walletShort = publicKey ? publicKey.toString().slice(0, 6) : null;

  const humanTokenIdentifier = useQuery(
    api.world.userStatus,
    worldId && walletShort ? { worldId, walletAddress: walletShort } : 'skip',
  );
  const players = [...game.world.players.values()];
  // Only look for human player if we have a valid token identifier
  const humanPlayer = humanTokenIdentifier
    ? players.find((p) => p.human === humanTokenIdentifier)
    : undefined;
  const humanConversation = humanPlayer ? game.world.playerConversation(humanPlayer) : undefined;
  // Always select the other player if we're in a conversation with them.
  if (humanPlayer && humanConversation) {
    const otherPlayerIds = [...humanConversation.participants.keys()].filter(
      (p) => p !== humanPlayer.id,
    );
    playerId = otherPlayerIds[0];
  }

  const player = playerId && game.world.players.get(playerId);
  const playerConversation = player && game.world.playerConversation(player);

  const previousConversation = useQuery(
    api.world.previousConversation,
    playerId ? { worldId, playerId } : 'skip',
  );

  const playerDescription = playerId && game.playerDescriptions.get(playerId);

  const startConversation = useSendInput(engineId, 'startConversation');
  const acceptInvite = useSendInput(engineId, 'acceptInvite');
  const rejectInvite = useSendInput(engineId, 'rejectInvite');
  const leaveConversation = useSendInput(engineId, 'leaveConversation');

  if (!playerId) {
    return (
      <>
        <AgentList setSelectedElement={setSelectedElement} />
        {/* <div className="h-full text-xl flex text-center items-center bubble-notip  mt-4">
          <p className="bg-white text-black"> Click on an agent on the map to see chat history.</p>
        </div> */}
      </>
    );
  }
  if (!player) {
    return null;
  }
  const isMe = humanPlayer && player.id === humanPlayer.id;
  const canInvite = !isMe && !playerConversation && humanPlayer && !humanConversation;
  const sameConversation =
    !isMe &&
    humanPlayer &&
    humanConversation &&
    playerConversation &&
    humanConversation.id === playerConversation.id;

  const humanStatus =
    humanPlayer && humanConversation && humanConversation.participants.get(humanPlayer.id)?.status;
  const playerStatus = playerConversation && playerConversation.participants.get(playerId)?.status;

  const haveInvite = sameConversation && humanStatus?.kind === 'invited';
  const waitingForAccept =
    sameConversation && playerConversation.participants.get(playerId)?.status.kind === 'invited';
  const waitingForNearby =
    sameConversation && playerStatus?.kind === 'walkingOver' && humanStatus?.kind === 'walkingOver';

  const inConversationWithMe =
    sameConversation &&
    playerStatus?.kind === 'participating' &&
    humanStatus?.kind === 'participating';

  const onStartConversation = async () => {
    if (!humanPlayer || !playerId) {
      return;
    }
    console.log(`Starting conversation`);
    await toastOnError(startConversation({ playerId: humanPlayer.id, invitee: playerId }));
  };
  const onAcceptInvite = async () => {
    if (!humanPlayer || !humanConversation || !playerId) {
      return;
    }
    await toastOnError(
      acceptInvite({
        playerId: humanPlayer.id,
        conversationId: humanConversation.id,
      }),
    );
  };
  const onRejectInvite = async () => {
    if (!humanPlayer || !humanConversation) {
      return;
    }
    await toastOnError(
      rejectInvite({
        playerId: humanPlayer.id,
        conversationId: humanConversation.id,
      }),
    );
  };
  const onLeaveConversation = async () => {
    if (!humanPlayer || !inConversationWithMe || !humanConversation) {
      return;
    }
    await toastOnError(
      leaveConversation({
        playerId: humanPlayer.id,
        conversationId: humanConversation.id,
      }),
    );
  };
  // const pendingSuffix = (inputName: string) =>
  //   [...inflightInputs.values()].find((i) => i.name === inputName) ? ' opacity-50' : '';

  const pendingSuffix = (s: string) => '';
  return (
    <>
      <div className="flex gap-4">
        <div className="box w-3/4 sm:w-full mr-auto">
          <h2 className="bg-[#964253] p-2 font-display text-2xl sm:text-4xl tracking-wider shadow-solid text-center">
            {playerDescription?.name}
          </h2>
        </div>
        <a
          className="button text-white shadow-solid text-2xl cursor-pointer pointer-events-auto"
          onClick={() => setSelectedElement(undefined)}
        >
          <h2 className="h-full bg-clay-700">
            <img className="w-4 h-4 sm:w-5 sm:h-5" src={closeImg} />
          </h2>
        </a>
      </div>
      {canInvite && (
        <div className="button mt-6  bg-clay-700  rounded-full flex justify-center">
          <a
            className={
              '  text-white bg-clay-700   text-xl cursor-pointer pointer-events-auto' +
              pendingSuffix('startConversation')
            }
            onClick={onStartConversation}
          >
            Start conversation
          </a>
        </div>
      )}
      {waitingForAccept && (
        <div className="button mt-6 bg-clay-700 rounded-full flex justify-center">
          <a className="  text-white  text-xl cursor-pointer pointer-events-auto opacity-50">
            <div className=" bg-clay-700 text-center">Waiting for accept..</div>
          </a>
        </div>
      )}
      {waitingForNearby && (
        <div className="button mt-6 bg-clay-700 rounded-full flex justify-center">
          <a className="  text-white  text-xl cursor-pointer pointer-events-auto opacity-50">
            <div className=" bg-clay-700 text-center">Walking over..</div>
          </a>
        </div>
      )}
      {inConversationWithMe && (
        <div className="button mt-6 bg-clay-700 rounded-full flex justify-center">
          <a
            className={
              '  text-white bg-clay-700 w text-xl cursor-pointer pointer-events-auto' +
              pendingSuffix('leaveConversation')
            }
            onClick={onLeaveConversation}
          >
            Leave conversation
          </a>
        </div>
      )}
      {haveInvite && (
        <>
          <div className="button mt-6 bg-clay-700 rounded-full flex justify-center">
            <a
              className={
                '  text-white bg-clay-700 w text-xl cursor-pointer pointer-events-auto' +
                pendingSuffix('acceptInvite')
              }
              onClick={onAcceptInvite}
            >
              Accept
            </a>
          </div>
          <div className="button mt-6 bg-clay-700 rounded-full flex justify-center">
            <a
              className={
                '  text-white bg-clay-700 w text-xl cursor-pointer pointer-events-auto' +
                pendingSuffix('rejectInvite')
              }
              onClick={onRejectInvite}
            >
              Reject
            </a>
          </div>
        </>
      )}
      {!playerConversation && player.activity && player.activity.until > Date.now() && (
        <>
          {' '}
          <div className="box flex-grow mt-6">
            <h2 className="bg-[#964253] text-base sm:text-lg text-center">
              {player.activity.description}
            </h2>
          </div>
        </>
      )}

      <div className="desc my-6">
        <p className="leading-tight -m-4 bg-[#964253] text-base sm:text-sm">
          {!isMe && (
            <ShareableCard
              playerName={playerDescription!.name}
              description={playerDescription!.description}
            />
          )}
          {isMe && <i>This is you!</i>}
          {!isMe && inConversationWithMe && (
            <>
              <br />
              <br />(<i>Conversing with you!</i>)
            </>
          )}
        </p>
      </div>
      {!isMe && playerConversation && playerStatus?.kind === 'participating' && (
        <Messages
          worldId={worldId}
          engineId={engineId}
          inConversationWithMe={inConversationWithMe ?? false}
          conversation={{ kind: 'active', doc: playerConversation }}
          humanPlayer={humanPlayer}
          scrollViewRef={scrollViewRef}
        />
      )}
      {!playerConversation && previousConversation && (
        <>
          <div className="box flex-grow my-2">
            <h2 className="bg-[#964253] text-lg text-center">Previous conversation</h2>
          </div>
          <Messages
            worldId={worldId}
            engineId={engineId}
            inConversationWithMe={false}
            conversation={{ kind: 'archived', doc: previousConversation }}
            humanPlayer={humanPlayer}
            scrollViewRef={scrollViewRef}
          />
        </>
      )}
    </>
  );
}
