import React, { useEffect, useState } from 'react';
import { Button, Switch } from '@nextui-org/react'
import { IconBolt } from '@tabler/icons-react';
import { useUser } from '@/contexts/user.context';

export default function ButtonModes({modes, handleSetModes, searchGame} :
	{modes: boolean, handleSetModes: (value: boolean) => void, searchGame: boolean }) {

		function DisplayHint() {
			handleSetModes(true);
		}

		function HideHint() {
			handleSetModes(false);
		}
		if (searchGame === true)
		{
			return <>
				<Switch
					disabled
					checked={modes}
					onChange={HideHint}
					size="xl"
					color={'warning'}
					icon={<IconBolt/>}
				/>
			</>
		}
		if (modes === true) {
			return <>
				<Switch
					checked={modes}
					onChange={HideHint}
					size="xl"
					color={'warning'}
					icon={<IconBolt/>}
				/>
			</>
		}
		else {
			return <>
				<Switch
					checked={modes}
					onChange={DisplayHint}
					size="xl"
					color={'error'}
					icon={<IconBolt/>}
				/>
			</>
		}
}
