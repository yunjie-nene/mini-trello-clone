import Header from './components/Header';
import Board from './components/Board';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
    </div>
  );
}

export default App;