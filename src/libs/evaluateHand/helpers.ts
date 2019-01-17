import { Card } from "../models";
import _ from 'lodash';
import { ICard, IPlayer } from '../../helpers/interfaces';
import { EvaluationResult, getWinningHandName, getHighCardName } from '../../classes/evaluationResult.class';
import { getEvaluationResultFromHand } from './evaluateHand';

/**
 * Factory function for number of sets expected in 5 card array
 * @param {Array<Card>}hand array of 5 Card Objects
 * @param {number} kindNumber Number of cards expected (e.g. For a four cards of a kind it's 4)
 * @param {number} sets Number of sets expected (e.g. for 2 pairs set it to 2)
 */
const hasNumberOfCardsOfAKind = (hand: Card[], kindNumber: number, sets: number): boolean => {
  const rankGroups = _.groupBy(hand, 'rank');
  return Object.keys(rankGroups).map((key: string) => rankGroups[key])
    .filter((cardGroup: Card[]) => cardGroup.length)
    .filter((cardGroup: Card[]) => cardGroup.length === kindNumber)
    .length === sets;
}

/**
 * This method if a factory for getting values from certain group sizes
 * @param {Array<Card>} hand array of 5 Card Objects
 * @param groupSize size of the expected group
 * @returns {number} value of a group
 */
const getGroupValue = (hand: Card[], groupSize: number): number => _.filter(_.groupBy(hand, 'rank'), item => item.length === groupSize)[0][0].value;

const getFourOfAKindGroupValue = (hand: Card[]): number => _.partial(getGroupValue, _, 4)(hand);
const getThreeOfAKindGroupValue = (hand: Card[]): number => _.partial(getGroupValue, _, 3)(hand);
const getPairGroupValue = (hand: Card[]): number => _.partial(getGroupValue, _, 2)(hand);

const getPairsGroupValues = (hand: Card[]): PairValues => ({
  lowPairValue: _.filter(_.groupBy(hand, 'rank'), item => item.length === 2)[0][0].value,
  highPairValue: _.filter(_.groupBy(hand, 'rank'), item => item.length === 2)[1][0].value,
})

const hasStraight = (hand: Card[]): boolean => _.sortBy(hand, 'rank').reduce((isStraight: boolean, currentCard: Card, i: number, arr: Card[]) => {
  if (i === 0) return isStraight && true;
  if (arr[i - 1].rank + 1 === currentCard.rank) return isStraight && true;
  return isStraight && false;
}, true);

const everyCardIsSameSuit = (hand: Card[]): boolean => Object.keys(_.groupBy(hand, 'suit')).length === 1;

const isRoyal = (hand: Card[]): boolean => {
  const sortedHandByValue = _.sortBy(hand, 'rank');
  if (sortedHandByValue[0].value !== 14) return false;
  return sortedHandByValue.reduce((isRoyal: boolean, currentCard: Card, i: number) => {
    if (i === 0) return isRoyal && true;
    if (sortedHandByValue[i - 1].rank + 1 === currentCard.rank) return isRoyal && true;
    return isRoyal && false;
  }, true);
}

const hasFourOfAKind = (hand: Card[]): boolean => _.partial(hasNumberOfCardsOfAKind, _, 4, 1)(hand);

const hasThreeOfAKind = (hand: Card[]): boolean => _.partial(hasNumberOfCardsOfAKind, _, 3, 1)(hand);
const hasTwoPairs = (hand: Card[]): boolean => _.partial(hasNumberOfCardsOfAKind, _, 2, 2)(hand);
const hasOnePair = (hand: Card[]): boolean => _.partial(hasNumberOfCardsOfAKind, _, 2, 1)(hand);
const getHighCard = (hand: Card[]): Card => _.sortBy(hand, 'value').reverse()[0];

class PairValues {
  lowPairValue: number
  highPairValue: number
}

const mapICardToCard = (iCards: ICard[]): Card[] => {
  let cards: Card[] = [];
  iCards.forEach((iCard, index) => {

    const card = new Card(mapRankToNumber(iCard.rank), iCard.suit);
    console.log(card);
    cards.push(card);
  })

  return cards;
}

const mapRankToNumber = (rank: string): number => {
  let rankNumber: number;

  switch (rank) {
    case 'A':
      rankNumber = 1;
      break;
    case 'K':
      rankNumber = 13;
      break;
    case 'Q':
      rankNumber = 12;
      break;
    case 'J':
      rankNumber = 11;
      break;
    default:
      rankNumber = parseInt(rank);
      break;
  }
  return rankNumber;

}

//creates string array with notifications for players and their final hands
const UIGetStringArrayFromFinalHands = (players: IPlayer[]): string[] => {
  let evaluationResults: string[] = [];

  players.forEach((player: IPlayer, index: number) => {
    const evaluationResult: EvaluationResult | null = getEvaluationResultFromHand(mapICardToCard(player.hand));
    if (evaluationResult) {
      const winningHandName: string = getWinningHandName(evaluationResult.power)
      const highCardName: string = getHighCardName(evaluationResult.highCardValue)
      console.log(evaluationResult);
      evaluationResults.push(`${player.name} has a ${winningHandName} with high card ${highCardName}`)
    }
    else {
      evaluationResults.push('');
    }
  })
  return evaluationResults;
}

//extracts final hands from players
const getFinalHandArrayFromPlayersArray = (players: IPlayer[]): string[] => {
  let evaluationResults: string[] = [];

  players.forEach((player: IPlayer, index: number) => {
    const evaluationResult: EvaluationResult | null = getEvaluationResultFromHand(mapICardToCard(player.hand));
    const winningHandName: string = getWinningHandName(evaluationResult !== null ? evaluationResult.power : 0)
    evaluationResults.push(winningHandName);
  });
  return evaluationResults;
}
// computes winning hand from players
const getWinningHandFromPlayers = (players: IPlayer[]): void => {

  let evaluationResults: EvaluationResult[] = [];
  players.forEach((player: IPlayer, index: number) => {
    const evaluationResult: EvaluationResult | null = getEvaluationResultFromHand(mapICardToCard(player.hand));
    evaluationResults.push(evaluationResult? evaluationResult: <EvaluationResult>{});
  });
  
  const reducer = (prevValue: EvaluationResult, currValue: EvaluationResult): EvaluationResult => {

    if (prevValue.power && currValue.power) {
      if (prevValue.power < currValue.power) {
        return currValue;
      }
      else if (prevValue.power > currValue.power) {
        return prevValue;
      }
      else if (prevValue.highPairValue > currValue.highPairValue) {
        return prevValue;
      }
      else if (prevValue.highPairValue < currValue.highPairValue) {
        return currValue;
      }
      else {
        return prevValue;
      }
    }
    return prevValue;

  }
  console.log(evaluationResults.reduce(reducer));

}
export {
  everyCardIsSameSuit,
  isRoyal,
  hasStraight,
  hasFourOfAKind,
  hasThreeOfAKind,
  hasTwoPairs,
  hasOnePair,
  getHighCard,
  getFourOfAKindGroupValue,
  getThreeOfAKindGroupValue,
  getPairGroupValue,
  getPairsGroupValues,
  PairValues,
  mapRankToNumber,
  mapICardToCard,
  UIGetStringArrayFromFinalHands,
  getFinalHandArrayFromPlayersArray,
  getWinningHandFromPlayers
}