import React from "react";
import NoSites from "../components/NoSites";

const Subscriptions = React.createClass( {
	render: function() {
		return ( <h1>Your subscriptions</h1> );
	},
} );

const Sites = React.createClass( {
	render: function() {
		return ( <NoSites onClick={() => {}} /> );
	},
} );

const Courses = React.createClass( {
	render: function() {
		return ( <h1>Your courses</h1> );
	},
} );

const Account = React.createClass( {
	render: function() {
		return ( <h1>Your account details</h1> );
	},
} );

let menuItems = [
	{ path: "/subscriptions", title: "Subscriptions", component: Subscriptions },
	{ path: "/sites", title: "Sites", component: Sites },
	{ path: "/courses", title: "Courses", component: Courses },
	{ path: "/account", title: "Account", component: Account },
];

export default menuItems;
