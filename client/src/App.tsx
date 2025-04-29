import Header from './components/Header';
import { Outlet } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';

const App = () => {
  return (
    <ApolloProvider client={client}>
      {/* Your existing app structure - don't add another Router here */}
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 overflow-hidden">
        <Outlet />
        </div>
      </div>
    </ApolloProvider>
  );
};

export default App;