import type {Base} from '../kit/actions';

/* Characters of «30 дней обмена». Key = id used in <Actor who="..."/>; `sp` = speaker code in lines.json.
   One body colour per character, no two the same. Gloves and helmets are added per scene (props on Actor). */
export type CastMember = Base & {sp?: string};
export const GL_Z = '#ffd34a'; // перчатки и шлем Захара
export const GL_L = '#8fd3ff'; // перчатки и шлем Льва

export const CAST: Record<string, CastMember> = {
	// Захар Рудин, «Молот»: красный, короткая тёмная стрижка
	zakhar: {sp: 'ZAKHAR', color: '#e0452e', outfit: 'tee', hair: 'short', hairColor: '#2a1c14', rim: '#ffe3d6', rimW: 2.4, shoe: '#f2f2f2', bulk: 1.15},
	// Лев Арский, гроссмейстер: синий, очки, каштановые волосы
	lev: {sp: 'LEV', color: '#2f6fd8', outfit: 'suit', hair: 'short', hairColor: '#6b4a2a', acc: ['glasses'], rim: '#e6f0ff', rimW: 2.4, shoe: '#1b2440'},
	// Ада Марковна: сиреневая кофта, седой пучок, очки
	ada: {sp: 'ADA', color: '#9a5bc7', outfit: 'coat', hair: 'bun', hairColor: '#d6d6de', acc: ['glasses'], rim: '#f3e6ff', rimW: 2.4, shoe: '#3a2550', scale: 0.92},
	// Палыч: зелёная толстовка, кепка, усы
	palych: {sp: 'PALYCH', color: '#3f9e58', outfit: 'hoodie', hair: 'cap', hairColor: '#f1ead8', acc: ['mustache'], rim: '#e6ffe9', rimW: 2.4, shoe: '#1a2a1e'},
	// без голоса (облачка)
	tim: {color: '#f08a3c', outfit: 'tee', hair: 'spiky', hairColor: '#5a3a22', rim: '#fff0e0', rimW: 2.4, shoe: '#f2f2f2', scale: 0.62},
	ded: {color: '#6f8f9a', outfit: 'coat', hair: 'grey', rim: '#e8f6fa', rimW: 2.4, shoe: '#2a3a40', scale: 0.95},
	junior: {color: '#35b8c2', outfit: 'tee', hair: 'spiky', hairColor: '#1d2a30', rim: '#e0fbff', rimW: 2.4, shoe: '#f2f2f2', scale: 0.9},
	ref: {color: '#e9eef5', outfit: 'tee', hair: 'none', rim: '#ffffff', rimW: 2.4, shoe: '#111'},
	foe: {color: '#8b5cf6', outfit: 'tee', hair: 'none', rim: '#efe6ff', rimW: 2.4, shoe: '#f2f2f2'},
	seller: {color: '#d97fa6', outfit: 'apron', hair: 'bob', hairColor: '#7a3b2a', rim: '#ffe6f0', rimW: 2.4, shoe: '#402030'},
};
