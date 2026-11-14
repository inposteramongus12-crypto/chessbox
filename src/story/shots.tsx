import React from 'react';
import type {ShotDef} from '../kit/coverage';
import {StubScene} from '../stub';

// ЗАГЛУШКА: список сцен ролика. Заполняется вместе со сценарием.
// Сцена обёрнута функцией: stub.tsx тянет kit, а kit/coverage тянет этот файл (циклический импорт).
const Stub1: React.FC = () => <StubScene />;
export const SHOTS: ShotDef[] = [{at: '001', C: Stub1, own: true}];
