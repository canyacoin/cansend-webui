import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import ReduxThunk from 'redux-thunk'
import { AppContainer } from 'react-hot-loader';
import { register as registerServiceWorker } from 'register-service-worker';

// store
import reducer, { initialState } from 'app/app.store.reducer'

// app entry 
import App from 'app/app.jsx';

// style
import 'app.style/reset.scss';
import 'app.style/typeography.scss';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
	reducer,
	initialState,
	composeEnhancers(
		applyMiddleware(ReduxThunk)
	)
);

ReactDOM.render(
		<AppContainer>
			<Provider store={store}>
				<Router>
					<Route path="/:url?" component={App}></Route>
				</Router>
			</Provider>
		</AppContainer>,
	document.getElementById('root')
);

if (module.hot) {
	module.hot.accept('./app/app.jsx', () => {
		const NextApp = require('./app/app.jsx').default; // eslint-disable-line global-require
		ReactDOM.render(
			<AppContainer>
				<Provider store={store}>
					<Router>
						<Route path="/:url?" component={NextApp}></Route>
					</Router>
				</Provider>
			</AppContainer>,
			document.getElementById('root')
		);
	});
}

registerServiceWorker();