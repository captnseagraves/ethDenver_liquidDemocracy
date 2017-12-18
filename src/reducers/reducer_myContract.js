import { INSTANTIATE_CONTRACT } from '../actions/index'

export default function(state = null, action){

  switch (action.type) {
    case INSTANTIATE_CONTRACT:
      return action.payload

    default:
    return state;
  }

}
