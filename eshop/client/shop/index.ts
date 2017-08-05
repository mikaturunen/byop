export { default as Header } from './components/Header';
export { default as MainContent } from './components/MainContent';
export * from './actions';
import * as model from './model';
export { model };
import reducer from './reducer';
export default reducer;
