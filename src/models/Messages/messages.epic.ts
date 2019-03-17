import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ofType, combineEpics } from 'redux-observable';

import { ADD_MESSAGE, addMessage } from './messages.action.creator';
import { DEAL_CARDS } from '../Game/game.actions.creator';

import { MessagesState } from 'src/types';

const messagesEpic = (action$: Observable<any>, state$: MessagesState) => action$.pipe(
  ofType(ADD_MESSAGE),
  map(() =>{

    const state: string[] = (state$.list || []);
    console.clear();
    console.log(state);

  })
);

const cardsDealtEpic = (action$: Observable<any>, state$: MessagesState) => action$.pipe(
  ofType(DEAL_CARDS),
  map(() => {
    return addMessage({
      message: 'HANDS DEALT! GOOD LUCK'
    });
  })
);

export default combineEpics(
  messagesEpic,
  cardsDealtEpic,
 );