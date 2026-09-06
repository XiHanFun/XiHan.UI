import { useMachine } from '../src/runtime/use-machine'
import { describeRuntimeContract } from './support/runtime-contract'

describeRuntimeContract('react', useMachine)
