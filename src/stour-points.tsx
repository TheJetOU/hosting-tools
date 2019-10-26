/** Round -> Points */
const SMOGON_TOUR_POINTS: {[k: number]: number} = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 5,
	5: 7,
	6: 9,
	7: 11,
	8: 13,
};

class StourPoints extends React.Component<{}, {
	points: string;
	playerlist: string,
}> {
	state = {
		points: '',
		playerlist: '',
	};
	getPlayerlist() {
		const playerlist = new Map<string, string>();
		for (const players of this.state.playerlist.split('\n').map((val) => val.split(/ vs.? /gi))) {
			if (players.length !== 2) continue;
			const [p1, p2] = players;
			if (!/Bye\d+/.test(p1)) {
				playerlist.set(p1.toLowerCase(), p1);
			}
			if (!/Bye\d+/.test(p2)) {
				playerlist.set(p2.toLowerCase(), p2);
			}
		}
		return playerlist;
	}
	getMatchups() {
		const matchups = new Map<string, string[]>();
		for (const players of this.state.playerlist.split('\n').map((val) => val.split(/ vs.? /gi))) {
			if (players.length !== 2) continue;
			const [p1, p2] = players.map((player) => player.toLowerCase());
			if (!/Bye(\d+)?/i.test(p1)) {
				const p1Matchups = matchups.get(p1);
				matchups.set(p1, (p1Matchups || []).concat(p2));
			}
			if (!/Bye(\d+)?/i.test(p2)) {
				const p2Matchups = matchups.get(p2);
				matchups.set(p2, (p2Matchups || []).concat(p1));
			}
		}
		return matchups;
	}
	getPoints = () => {
		// TODO: write tests
		const matchups = this.getMatchups();
		const playerlist = this.getPlayerlist();
		/** occurence -> player */
		const occurences: {[occurence: number]: string[]} = {};
		for (const [player, mus] of matchups.entries()) {
			const byeMatchups = mus.filter((mu) => /Bye(\d+)?/i.test(mu));
			const occurence = byeMatchups.length + 1 === mus.length ? 0 : mus.length - 1;
			occurences[occurence] = (occurences[occurence] || []).concat(playerlist.get(player)!);
		}
		this.setState({
			points: Object.entries(SMOGON_TOUR_POINTS).map(([round, point]) => {
				let buf = `${point} Points\n`;
				return buf += (occurences[parseInt(round, 10)] || []).join(', ');
			}).join('\n\n'),
		});
	}
	handleChange = (val: string) => {
		this.setState({
			playerlist: val,
		});
	}
	render() {
		return (
			<div className="stour-points">
				<textarea onChange={(e) => this.handleChange(e.target.value)}>
				</textarea>
				<button onClick={() => this.getPoints()}>Get Points</button>
				<textarea value={this.state.points} placeholder='Points will be here' readOnly>
				</textarea>
			</div>
		);
	}
}

ReactDOM.render(
	<StourPoints />,
	document.getElementById('stour-points'),
);