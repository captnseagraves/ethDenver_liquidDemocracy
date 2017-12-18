import { GET_WEB3 } from '../actions/index'

export default function(state = null, action){

  switch (action.type) {
    case GET_WEB3:
      return action.payload

    default:
    return state;
  }

}
