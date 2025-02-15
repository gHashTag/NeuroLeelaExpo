import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { H1, Muted } from "@/components/ui/typography";
import { MarkdownText } from "@/components/ui";
import { Button, buttonTextVariants } from "@/components/ui/button";
import { router } from 'expo-router';

export default function Report() {
	const [text, setText] = useState('');
	const [error, setError] = useState('');

	const handleTextChange = (input: string) => {
		setText(input);
		if (input.length < 50 || input.length > 300) {
			setError('Текст должен содержать от 50 до 300 символов.');
		} else {
			setError('');
		}
	};

	const markdownContent = `
   # Plan 1. Birth (janma)

   ---

   Birth is the entrance to the karmic game. Karma is determined by the number of points rolled on the die, and the player's personality is represented on the field by some symbol that moves from square to square in accordance with its lot. Before birth, a person is out of the game. Having taken birth, he becomes subject to the laws of karma. This world is the land of karma.

   Desire leads the player to accept the burden of karma. If a person has no desire to play, he will not do it. However, the game lies in the very nature of consciousness. At the beginning there was no game, but consciousness, in accordance with its nature, could not remain motionless, without a game. And so... "Let there be light!" Let there be a game! And the Absolute from One turned into many. Entering the game, the player repeats the original process of creation, when the Absolute awakened from inactivity and began a cosmic game in which each of us is a microcosm. Having decided to play, the player must obey the rules of the game (Dharma) and the karmic lot.

   The player can enter the game only after he manages to throw a six. The five elements of creation (ether, air, fire, water and earth) are connected to the sixth - the player's consciousness. The six starts the movement of the player's symbol across the field. Each birth opens a new game, and the goal of each game is the same Cosmic Consciousness. There are no other directions, goals, motivations in this game. The game exists to complete the cycle. Birth is the key. It opens the doors to the game, and the player begins his endless journey, the journey to completeness.

   The unit is the root of all creation. Like all odd numbers, it belongs to the family of the Sun. The unit has a special relationship with the Sun, since it was it that gave birth to our planet. The unit symbolizes an independent person, an independent decision, an independent life, the search for something new, unusual, original.
   `;

   const onSubmit = () => {
		console.log("Текст отправлен:", text);
		router.push("/gamescreen");
	}

	return (
		<View style={styles.container}>
			<MarkdownText text={markdownContent} />
			<TextInput
				style={styles.textInput}
				placeholder="Введите текст"
				onChangeText={handleTextChange}
				value={text}
				multiline
				maxLength={300}
			/>
			{!!error && <Text style={styles.errorText}>{error}</Text>}
			<Button
				size="default"
				variant="default"
				onPress={onSubmit}
				disabled={!!error || text.length < 50 || text.length > 300}
				className="web:m-4"
			>
				<Text className={buttonTextVariants({ variant: "default" })}>
					Отправить
				</Text>
			</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'background',
		padding: 4,
		gap: 4,
		paddingBottom: 20,
	},
	textInput: {
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		padding: 10,
		width: '100%',
		borderRadius: 5,
	},
	errorText: {
		color: 'red',
	},
});
