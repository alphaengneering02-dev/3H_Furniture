import axios from 'axios';
import Router from './router/Router';
import './css/global.css';

axios.defaults.withCredentials = true;


function App() {
  return (
    <div className="App">

      <Router />


    </div>
  );
}

export default App;
