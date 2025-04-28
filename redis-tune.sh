#!/bin/bash

# 커널 파라미터 튜닝
sudo sysctl -w net.core.somaxconn=65535
sudo sysctl -w net.ipv4.tcp_max_syn_backlog=65535
sudo sysctl -w net.ipv4.tcp_fin_timeout=15
sudo sysctl -w net.ipv4.tcp_tw_reuse=1
sudo sysctl -w vm.overcommit_memory=1
sudo sysctl -w net.core.netdev_max_backlog=5000
sudo sysctl -w net.ipv4.ip_local_port_range="1024 65000"
sudo sysctl -w net.ipv4.tcp_rmem="4096 87380 6291456"
sudo sysctl -w net.ipv4.tcp_wmem="4096 16384 4194304"
sudo sysctl -w net.core.rmem_max=268435456
sudo sysctl -w net.core.wmem_max=268435456
sudo sysctl -w net.ipv4.tcp_syncookies=1

# 적용 확인
echo "==== Redis용 sysctl 최적화 완료 ===="
sysctl -p || true
