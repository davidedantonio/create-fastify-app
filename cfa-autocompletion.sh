#!/bin/bash
_create-fastify-app()
{
    local cur prev

    cur=${COMP_WORDS[COMP_CWORD]}
    prev=${COMP_WORDS[COMP_CWORD-1]}

    case ${COMP_CWORD} in
        1)
            COMPREPLY=($(compgen -W "generate:project generate:service add:mysql add:mongo add:cors add:redis add:postgres" -- ${cur}))
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}

complete -F _create-fastify-app create-fastify-app
