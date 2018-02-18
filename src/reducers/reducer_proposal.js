export const proposalReducer = (state=[], action) => {
  switch (action.type) {
    case 'ADD_PROPOSAL':
      return [...state, action.proposal]
    default:
      return state; 
  }
}

// export default proposalReducer;

//store should be an array of objects
//objects should have key value pairs